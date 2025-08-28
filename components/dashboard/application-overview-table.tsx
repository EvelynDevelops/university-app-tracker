"use client";

import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const applications = [
  {
    id: "1",
    university: "MIT",
    program: "CS (MEng)",
    deadline: "2025-01-05",
    status: "In Progress",
    stage: "Preparing",
  },
  {
    id: "2",
    university: "Stanford",
    program: "CS (MS)",
    deadline: "2025-01-10",
    status: "Submitted",
    stage: "Submitted",
  },
  {
    id: "3",
    university: "UCLA",
    program: "Data Science (MS)",
    deadline: "2024-12-20",
    status: "Awaiting Decision",
    stage: "Decision",
  },
  {
    id: "4",
    university: "CMU",
    program: "Software Engineering (MSSE)",
    deadline: "2025-02-01",
    status: "In Progress",
    stage: "To Do",
  },
  {
    id: "5",
    university: "UT Austin",
    program: "ECE (MS)",
    deadline: "2025-01-15",
    status: "Accepted",
    stage: "Decision",
  },
];

function ContributorsOverviewTable() {
  const router = useRouter()

  const handleRowClick = (applicationId: string) => {
    router.push(`/student/applications/${applicationId}`)
  }

  return (
    <div className="max-w-3xl mx-auto rounded-xl border border-border bg-background p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-foreground">Applications Overview</h2>
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">University</TableHead>
            <TableHead>Program</TableHead>
            <TableHead className="w-[130px]">Deadline</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="text-right w-[120px]">Stage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow 
              key={app.id} 
              className="hover:bg-muted/40 transition-colors cursor-pointer"
              onClick={() => handleRowClick(app.id)}
            >
              <TableCell className="font-medium">{app.university}</TableCell>
              <TableCell>{app.program}</TableCell>
              <TableCell>{app.deadline}</TableCell>
              <TableCell>
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                    app.status === "Accepted"
                      ? "bg-green-100 text-green-700"
                      : app.status === "Submitted"
                      ? "bg-blue-100 text-blue-700"
                      : app.status === "Awaiting Decision"
                      ? "bg-purple-100 text-purple-700"
                      : app.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {app.status}
                </span>
              </TableCell>
              <TableCell className="text-right">{app.stage}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4} className="text-right font-semibold">
              Total Applications
            </TableCell>
            <TableCell className="text-right font-bold text-foreground">{applications.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <p className="mt-4 text-center text-sm text-muted-foreground">track your university applications</p>
    </div>
  );
}

export default ContributorsOverviewTable;
