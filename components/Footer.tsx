const footerLinks = {
  Movies: ["Now Showing", "Coming Soon", "Top Rated", "Cinemas Near Me"],
  Support: ["Help Center", "Ticket Policy", "Refunds", "Contact Us"],
  Account: ["My Profile", "Bookings", "Offers", "Gift Cards"],
};

export default function Footer() {
  return (
    <footer className="border-t border-[hsl(181_54%_37%/0.12)] py-12 bg-white/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h5 className="font-black text-[hsl(181_100%_9%)] uppercase text-sm mb-4">
                {section}
              </h5>
              <ul className="space-y-2 text-sm text-[hsl(181_100%_9%/0.6)]">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-[hsl(181_100%_9%)] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col">
            <h5 className="font-black text-[hsl(181_100%_9%)] uppercase text-sm mb-4">
              Follow Us
            </h5>
            <div className="flex gap-3">
              {["brand_awareness", "rss_feed", "share"].map((icon) => (
                <span
                  key={icon}
                  className="material-symbols-outlined p-2 rounded-full bg-[hsl(181_100%_9%/0.06)] cursor-pointer hover:bg-[hsl(181_100%_9%/0.12)] transition-colors"
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[hsl(181_54%_37%/0.1)] gap-4">
          <div className="flex items-center gap-2 text-[hsl(181_100%_9%/0.45)]">
            <span className="material-symbols-outlined text-2xl">movie_filter</span>
            <span className="text-xs font-bold">© 2026 PREBOOK.WATCH TICKETING SYSTEM</span>
          </div>
          <div className="flex gap-6 text-[10px] font-black uppercase text-[hsl(181_100%_9%/0.35)]">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
              <a key={item} href="#" className="hover:text-[hsl(181_100%_9%/0.7)] transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
