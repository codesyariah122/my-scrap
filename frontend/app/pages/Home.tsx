import { useState, useEffect, Key } from "react";
import { useScrape } from "@hooks/useScrape";
import Image from "next/image";

export default function Home() {
  const [url, setUrl] = useState("");
  const [selector, setSelector] = useState("");
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { mutate, data, isLoading } = useScrape();

  const handleScrape = () => {
    if (!url || !selector) {
      alert("Masukkan URL dan Selector yang valid!");
      return;
    }
    mutate({ url, selector });
    setTimer(0);
  };

  useEffect(() => {
    console.log("Data yang diterima:", data);
    if (!isLoading && data) {
      setTimer(0);
      if (intervalId) clearInterval(intervalId);
    }
  }, [data, isLoading, intervalId]);

  useEffect(() => {
    if (isLoading) {
      const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
      setIntervalId(id);
    } else {
      if (intervalId) clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  const htmlData = data?.[1] || [];
  const image = data?.[2] || "";
  const excelFile = data?.[3] || "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 sm:p-8 w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Web Scraper</h1>
      <div className="w-full max-w-lg mb-6">
        <Image
          src="/assets/images/img1.jpg"
          alt="Web Scraper"
          width={600}
          height={400}
          className="w-full h-auto rounded-lg shadow-md"
        />
      </div>
      <div className="w-full max-w-lg mb-4">
        <input
          type="text"
          placeholder="Masukkan URL"
          className="w-full p-3 mb-4 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="w-full max-w-lg mb-6">
        <input
          type="text"
          placeholder="Masukkan CSS Selector"
          className="w-full p-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selector}
          onChange={(e) => setSelector(e.target.value)}
        />
      </div>
      <button
        onClick={handleScrape}
        disabled={isLoading}
        className="w-full sm:w-auto px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? "Loading..." : "Scrape"}
      </button>

      {isLoading && (
        <div className="mt-4 text-gray-700">
          <strong>Tunggu Sebentar yah : </strong>
          {timer} detik
        </div>
      )}

      {excelFile && (
        <div className="mt-4">
          <a
            href={`/${excelFile}`}
            download
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Download File Excel
          </a>
        </div>
      )}

      {data && (
        <div className="mt-8 w-full max-w-screen">
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-6">
            <h3 className="text-gray-700 font-semibold">Hasil:</h3>

            <div className="grid grid-cols-3">
              {htmlData.map(
                (item: { html: never }, index: Key | null | undefined) => (
                  <div
                    key={index}
                    dangerouslySetInnerHTML={{ __html: item.html }}
                    className="text-gray-600"
                  />
                )
              )}
            </div>

            {image && (
              <div className="mt-4">
                <h4 className="text-gray-700 font-semibold">
                  Gambar Screenshot:
                </h4>
                <img
                  src={image}
                  alt="Screenshot"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
