"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LeadsTable({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const filteredLeads = leads.filter(
    (lead) =>
      lead.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ["Title", "Category", "Rating", "Reviews", "Address", "Phone", "Website", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map((row) =>
        [
          `"${row.title || ""}"`,
          `"${row.category || ""}"`,
          `"${row.rating || ""}"`,
          `"${row.reviews || ""}"`,
          `"${row.address || ""}"`,
          `"${row.phone || ""}"`,
          `"${row.website || ""}"`,
          `"${row.status || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "iklanin_leads.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScrape = async () => {
    if (!keyword) return alert("Masukkan kata kunci pencarian!");
    setIsScraping(true);
    
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert(`Berhasil! Menemukan ${data.insertedCount} leads baru.`);
      setShowModal(false);
      router.refresh(); 
      // Refresh the page fully to fetch new DB data
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (err: any) {
      alert("Error scraping: " + err.message);
    } finally {
      setIsScraping(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div>
      {/* HEADER SECTION */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <input
          type="text"
          placeholder="Cari nama bisnis atau kategori..."
          className="px-4 py-2 border border-gray-200 rounded-lg w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            + Mulai Scrape
          </button>
          
          <button
            onClick={exportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Export CSV
          </button>

          <button
            onClick={handleLogout}
            className="border border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MODAL SCRAPING */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Scrape Google Maps</h2>
            <p className="text-sm text-gray-500 mb-4">
              Masukkan target spesifik (Contoh: "Klinik Kecantikan Jakarta"). 
              <br/><br/>
              <span className="text-orange-500 font-medium">⚠️ Peringatan:</span> Proses ini akan membuka layar baru (Chrome) secara otomatis dan memakan waktu beberapa menit. Lepaskan keyboard & mouse Anda hingga selesai. Pastikan Anda menjalankan ini dari Localhost/Laptop Anda.
            </p>

            <input 
              type="text" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Distributor alat kesehatan di Bandung..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-green-500"
              disabled={isScraping}
            />

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                disabled={isScraping}
              >
                Batal
              </button>
              <button 
                onClick={handleScrape}
                className="px-4 py-2 bg-green-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center disabled:opacity-70"
                disabled={isScraping}
              >
                {isScraping ? "Sedang Berjalan 🏃‍♂️..." : "Mulai Ekstrak Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
              <th className="px-6 py-4 font-medium">Nama Bisnis</th>
              <th className="px-6 py-4 font-medium">Kategori</th>
              <th className="px-6 py-4 font-medium">Kontak</th>
              <th className="px-6 py-4 font-medium">Web / Rating</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  {leads.length === 0 ? "Belum ada data. Tekan tombol + Mulai Scrape" : "Tidak ada hasil pencarian dengah keyword ini."}
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{lead.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs" title={lead.address}>
                      {lead.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{lead.category}</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-800 font-medium">{lead.phone || "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline block mb-1"
                      >
                        Kunjungi Web
                      </a>
                    ) : (
                      <span className="text-gray-400 block mb-1">-</span>
                    )}
                    <div className="text-xs text-gray-500">
                      ⭐ {lead.rating || "-"} ({lead.reviews || "0"} review)
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      style={{
                        color: lead.status === "NEW" ? "green" 
                             : lead.status === "CONTACTED" ? "blue" 
                             : lead.status === "INTERESTED" ? "purple" : "red"
                      }}
                    >
                      <option value="NEW">✨ New</option>
                      <option value="CONTACTED">📞 Contacted</option>
                      <option value="INTERESTED">🔥 Interested</option>
                      <option value="REJECTED">❌ Rejected</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
