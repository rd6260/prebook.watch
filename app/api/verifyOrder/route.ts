import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

function generatedSignature(razorpayOrderId: string, razorpayPaymentId: string) {
  const keySecret = process.env.RAZORPAY_SECRET_ID as string;
  return crypto
    .createHmac('sha256', keySecret)
    .update(razorpayOrderId + '|' + razorpayPaymentId)
    .digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const {
      booking_id,
      payment_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method,
    } = await request.json();

    const signature = generatedSignature(razorpay_order_id, razorpay_payment_id);

    if (signature !== razorpay_signature) {
      await supabase
        .from('payments')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('payment_id', payment_id);

      return NextResponse.json(
        { message: 'Payment verification failed', isOk: false },
        { status: 400 }
      );
    }

    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        method: method ?? null,
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_id', payment_id);

    if (updatePaymentError) {
      console.error('Error updating payment:', updatePaymentError);
      return NextResponse.json({ message: 'Failed to update payment record', isOk: false }, { status: 500 });
    }

    const { error: updateBookingError } = await supabase
      .from('bookings')
      .update({ is_paid: true })
      .eq('id', booking_id);

    if (updateBookingError) {
      console.error('Error updating booking:', updateBookingError);
      return NextResponse.json({ message: 'Failed to update booking status', isOk: false }, { status: 500 });
    }

    return NextResponse.json({ message: 'Payment verified successfully', isOk: true }, { status: 200 });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ message: 'Payment verification failed', isOk: false }, { status: 500 });
  }
}
