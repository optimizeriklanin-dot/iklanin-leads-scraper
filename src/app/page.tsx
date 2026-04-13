import { prisma } from "@/lib/db";
import { LeadsTable } from "@/components/LeadsTable";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let leads = [];
  try {
    leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error: any) {
    console.error("Gagal koneksi DB di Vercel build:", error.message);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Iklanin Leads Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Data hasil scraping Google Maps</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{leads.length}</div>
            <div className="text-xs font-semibold uppercase text-gray-500">Total Leads</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <LeadsTable initialLeads={leads} />
        </div>
      </div>
    </main>
  );
}
