import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Building2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";
import { CreateProjectModal } from "./CreateProjectModal";
import { ProjectDetailsView } from "./ProjectDetailsView";
import { ProjectCard, BentoGrid, StaggerContainer, StaggerItem, MotionButton } from "./ui/motion";

export function ProjectsView() {
    const projects = useQuery(api.tasks.getProjects) || [];
    const { t } = useLanguage();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<any>(null);

    if (selectedProjectId) {
        return (
            <ProjectDetailsView
                projectId={selectedProjectId}
                onBack={() => setSelectedProjectId(null)}
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('projects')}</h2>
                    <p className="text-sm text-slate-500 font-medium">Overview of all active construction sites</p>
                </div>
                <MotionButton
                    onClick={() => setShowCreateModal(true)}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                    <Plus size={18} />
                    <span>New Project</span>
                </MotionButton>
            </div>

            <StaggerContainer>
                <BentoGrid columns={3}>
                    {projects.map((project: any, index: number) => (
                        <StaggerItem key={project._id}>
                            <ProjectCard
                                project={project}
                                onClick={() => setSelectedProjectId(project._id)}
                                delay={index * 0.05}
                            />
                        </StaggerItem>
                    ))}

                    {/* Add New Project Placeholder */}
                    <StaggerItem>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bento-card border-dashed border-2 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/10 transition-all min-h-[220px] rounded-3xl"
                        >
                            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-current transition-transform group-hover:scale-110">
                                <Plus size={28} />
                            </div>
                            <span className="font-bold text-sm tracking-wider uppercase">Add New Project</span>
                        </button>
                    </StaggerItem>
                </BentoGrid>
            </StaggerContainer>

            {showCreateModal && (
                <CreateProjectModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
}
