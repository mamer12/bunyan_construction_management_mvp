import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, Clock, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function DeveloperDashboard() {
  const units = useQuery(api.units.getAllUnits) || [];
  const tasksForReview = useQuery(api.tasks.getTasksForReview) || [];
  const reviewTask = useMutation(api.tasks.reviewTask);

  const handleApprove = async (taskId: string, approved: boolean) => {
    try {
      await reviewTask({ taskId: taskId as any, action: approved ? "approve" : "reject" });
      toast.success(approved ? "Task approved!" : "Task rejected!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bunyan Dashboard</h1>
            <p className="text-slate-600">Developer Control Panel</p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Clock className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Pending Review</p>
                  <p className="text-2xl font-bold text-slate-900">{tasksForReview.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Units</p>
                  <p className="text-2xl font-bold text-slate-900">{units.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Completed Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {units.filter(unit => unit !== null).reduce((acc, unit) => acc + unit.completedTasks, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Tasks</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {units.filter(unit => unit !== null).reduce((acc, unit) => acc + unit.taskCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task Approval Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Task Approval Queue</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksForReview.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No tasks pending review</p>
            ) : (
              <div className="space-y-4">
                {tasksForReview.filter(task => task !== null).map((task) => (
                  <div key={task._id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{task.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {task.project} - {task.unit} • {task.location}
                        </p>
                        {task.description && (
                          <p className="text-sm text-slate-500 mt-2">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-3">
                          <span className="text-sm font-medium text-green-600">
                            ${task.amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500">
                            Submitted {new Date(task.submittedAt!).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {task.photoUrl && (
                        <div className="ml-4">
                          <img
                            src={task.photoUrl}
                            alt="Proof of work"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button
                        onClick={() => handleApprove(task._id, true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleApprove(task._id, false)}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Units Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Units Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Unit</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {units.filter(unit => unit !== null).map((unit) => (
                    <tr key={unit._id} className="border-b border-slate-100">
                      <td className="py-3 px-4 font-medium text-slate-900">{unit.name}</td>
                      <td className="py-3 px-4 text-slate-600">{unit.project}</td>
                      <td className="py-3 px-4 text-slate-600">{unit.location}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={unit.status === "FINISHED" ? "default" : "secondary"}
                          className={unit.status === "FINISHED" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                        >
                          {unit.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{
                                width: `${unit.taskCount > 0 ? (unit.completedTasks / unit.taskCount) * 100 : 0}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-slate-600">
                            {unit.completedTasks}/{unit.taskCount}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
