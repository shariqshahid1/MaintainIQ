import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { IssueForm } from "@/components/issues/issue-form";

export default async function NewIssuePage() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Report Issue</h1>
        <p className="text-muted-foreground">
          Submit a new issue for an asset that needs attention.
        </p>
      </div>
      <IssueForm />
    </div>
  );
}
