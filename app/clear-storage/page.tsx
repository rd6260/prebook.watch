"use client"

import { useEffect, useState } from "react"

type StorageItem = {
  key: string
  value: string
}

export default function ClearStorageData() {
  const [items, setItems] = useState<StorageItem[]>([])

  const loadStorage = () => {
    const data: StorageItem[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) ?? ""
        data.push({ key, value })
      }
    }

    setItems(data)
  }

  useEffect(() => {
    loadStorage()
  }, [])

  const clearOne = (key: string) => {
    localStorage.removeItem(key)
    loadStorage()
  }

  const clearAll = () => {
    localStorage.clear()
    loadStorage()
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          localStorage Data
        </h1>

        {items.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            no localStorage data found
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
              >
                <div className="overflow-hidden">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {item.key}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-md">
                    {item.value}
                  </p>
                </div>

                <button
                  onClick={() => clearOne(item.key)}
                  className="ml-4 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md"
                >
                  clear
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={clearAll}
            className="w-full py-2 bg-black hover:bg-gray-800 text-white rounded-md"
          >
            clear all
          </button>
        </div>
      </div>
    </div>
  )
}
