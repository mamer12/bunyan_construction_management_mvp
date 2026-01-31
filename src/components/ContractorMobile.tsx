import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Camera, MapPin, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ProofUploadModal } from "./ProofUploadModal";
import { useLanguage } from "../contexts/LanguageContext";

export function ContractorMobile() {
  const { t, language } = useLanguage();
  const tasks = useQuery(api.tasks.getMyTasks) || [];
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REVIEW":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "REVIEW":
        return <Clock className="h-4 w-4" />;
      case "APPROVED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Mobile Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{language === 'ar' ? 'مهامي' : 'My Tasks'}</h1>
            <p className="text-slate-300 text-sm">{language === 'ar' ? 'بنيان للمقاولات' : 'Bunyan Construction'}</p>
          </div>
          <SignOutButton />
        </div>
      </header>

      {/* Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Pending</p>
                  <p className="text-lg font-bold text-slate-900">
                    {tasks.filter(t => t && t.status === "PENDING").length}
                  </p>
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
                  <p className="text-xs text-slate-600">Completed</p>
                  <p className="text-lg font-bold text-slate-900">
                    {tasks.filter(t => t && t.status === "APPROVED").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-500">No tasks assigned yet</p>
              </CardContent>
            </Card>
          ) : (
            tasks.filter(task => task !== null).map((task) => (
              <Card key={task._id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{task.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{task.project} - {task.unit}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-medium text-green-600">
                            ${task.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <Badge className={getStatusColor(task.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(task.status)}
                          <span className="text-xs">{task.status}</span>
                        </div>
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                    )}

                    {task.photoUrl && (
                      <div className="mb-3">
                        <img 
                          src={task.photoUrl} 
                          alt="Proof of work"
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                      </div>
                    )}

                    {task.status === "PENDING" && (
                      <Button 
                        onClick={() => setSelectedTask(task)}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Submit Proof of Work
                      </Button>
                    )}

                    {task.status === "REVIEW" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800 font-medium">
                          Proof submitted - awaiting review
                        </p>
                        {task.submittedAt && (
                          <p className="text-xs text-blue-600 mt-1">
                            Submitted on {new Date(task.submittedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {task.status === "APPROVED" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium">
                          ✅ Task approved - payment processed
                        </p>
                      </div>
                    )}

                    {task.status === "REJECTED" && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800 font-medium">
                          ❌ Task rejected - please resubmit
                        </p>
                        <Button 
                          onClick={() => setSelectedTask(task)}
                          className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Resubmit Proof
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Proof Upload Modal */}
      {selectedTask && (
        <ProofUploadModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
