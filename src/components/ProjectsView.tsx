import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Plus, Building2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";
import { CreateProjectModal } from "./CreateProjectModal";
import { ProjectDetailsView } from "./ProjectDetailsView";
import { ProjectCard, BentoGrid, StaggerContainer, StaggerItem, MotionButton } from "./ui/motion";

export function ProjectsView() {
    const projects = useQuery(api.projects.getProjects) || [];
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
        <div className="flex flex-col gap-6 md:gap-8 w-full max-w-[1600px]">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{t('projects')}</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">{t('projects') === 'المشاريع' ? 'نظرة عامة على مواقع البناء النشطة' : 'Overview of all active construction sites'}</p>
                </div>
                <MotionButton
                    onClick={() => setShowCreateModal(true)}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-md hover:bg-emerald-700 transition-all shrink-0"
                >
                    <Plus size={18} />
                    <span>{t('projects') === 'المشاريع' ? 'مشروع جديد' : 'New Project'}</span>
                </MotionButton>
            </header>

            <StaggerContainer className="w-full">
                <BentoGrid columns={3} className="w-full gap-5 md:gap-6">
                    {projects.map((project: any, index: number) => (
                        <StaggerItem key={project._id}>
                            <ProjectCard
                                project={project}
                                onClick={() => setSelectedProjectId(project._id)}
                                delay={index * 0.05}
                            />
                        </StaggerItem>
                    ))}

                    <StaggerItem>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="bento-card border-2 border-dashed border-slate-200 bg-slate-50/50 dark:bg-slate-800/30 dark:border-slate-600 flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 min-h-[240px] w-full transition-colors"
                        >
                            <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-current">
                                <Plus size={28} />
                            </div>
                            <span className="font-semibold text-sm uppercase tracking-wide">{t('projects') === 'المشاريع' ? 'إضافة مشروع' : 'Add New Project'}</span>
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
