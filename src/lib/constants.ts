import type { UserProfile, StudyMode, UserNote } from "@/types";

export interface NavItem {
  title: string; // Will now be a translation key e.g. "nav.dashboard"
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string; 
  label?: string;
  exactMatch?: boolean;
  subItems?: NavItem[];
  action?: "openShareDialog"; 
  customClass?: string; // Added for custom styling
}

export const NAV_ITEMS: NavItem[] = [
  { title: "nav.dashboard", href: "/dashboard", icon: "LayoutDashboard", exactMatch: true },
  // Study Modes as individual top-level items
  { title: "nav.tutorMode", href: "/study/tutor", icon: "GraduationCap" },
  { title: "nav.examMode", href: "/study/exam", icon: "ClipboardCheck" },
  { title: "nav.flashcards", href: "/study/flashcards", icon: "Layers3" },
  // End of Study Modes
  { title: "nav.myProgress", href: "/progress", icon: "TrendingUp" },
  { title: "nav.bookmarks", href: "/bookmarks", icon: "Bookmark" },
  { title: "nav.myNotes", href: "/my-notes", icon: "NotebookText" },
  { title: "nav.infographics", href: "/infographics", icon: "ImageIcon" },
  { title: "nav.shareApp", icon: "Share2", action: "openShareDialog" },
  { title: "nav.aboutUs", href: "/about", icon: "Info" },
];

export const ADMIN_DASHBOARD_NAV_ITEM: NavItem = {
  title: "nav.adminDashboard",
  href: "/admin/dashboard",
  icon: "LayoutGrid",
  customClass: "text-orange-600 dark:text-orange-400 hover:!text-orange-500 dark:hover:!text-orange-300 [&[data-active=true]]:!text-orange-500 dark:[&[data-active=true]]:!text-orange-300"
};

export const SETTINGS_NAV_ITEM: NavItem = { title: "nav.settings", href: "/settings", icon: "Settings" };


export const MOCK_USER: UserProfile = {
  name: "Dr. Alex Radiologist",
  email: "alex.rad@neuroradx.de",
  avatarUrl: "https://placehold.co/100x100.png",
  role: "specialist",
  subscriptionLevel: "premium",
};

export const STUDY_MODES: StudyMode[] = [
  { id: "tutor", name: "studyModes.tutor.name", description: "studyModes.tutor.description" },
  { id: "exam", name: "studyModes.exam.name", description: "studyModes.exam.description" },
  { id: "flashcards", name: "studyModes.flashcards.name", description: "studyModes.flashcards.description" },
];

// Values are now translation keys
export const subcategoryDisplayNames: Record<string, string> = {
  // Head Subcategories
  "Anatomy": "subtopics.anatomy",
  "CranialNerves": "subtopics.cranialnerves",
  "GeneticDevMetabolic": "subtopics.geneticdevmetabolic",
  "InfectionandInflammation": "subtopics.infectionandinflammation",
  "NeurodegenDementiaDemyelinating": "subtopics.neurodegendementiademyelinating",
  "Neuroimaging": "subtopics.neuroimaging",
  "OrbitandEye": "subtopics.orbitandeye",
  "Other": "subtopics.other", // General "Other" subtopic
  "Trauma": "subtopics.trauma",
  "Tumors": "subtopics.tumors",
  "Vascular": "subtopics.vascular",
  "Clinical Assessment": "subtopics.clinicalassessment",
  "Interventional Procedures": "subtopics.interventionalprocedures",
  "Pathophysiology": "subtopics.pathophysiology",
  "Pharmacology": "subtopics.pharmacology",


  // Spine Subcategories
  "TreatmentManagement": "subtopics.treatmentmanagement",
  "AnatomyRegions": "subtopics.anatomyregions", 
  "ImagingModalitiesFeatures": "subtopics.imagingmodalitiesfeatures",
  "PathologiesConditions": "subtopics.pathologiesconditions",
  "NeoplasmsTumors": "subtopics.neoplasmstranslated", 
  "ClinicalPresentationSymptoms": "subtopics.clinicalpresentationsymptoms",

  // Neck Subcategories
  "OralOropharynx": "subtopics.oraloropharynx",
  "NasalSinus": "subtopics.nasalsinus",
  "SenseHeadNeckReg": "subtopics.senseheadneckreg",
  "GlandLymphatic": "subtopics.glandlymphatic",
  // "Other" for Neck is covered by the generic "subtopics.other"

  // General Subcategories (from MENU_DATA in study/[mode]/page.tsx)
  "GenMuscStruct": "subtopics.genmuscstruct",
  "HeadNeckCNS": "subtopics.headneckcns",
  "TrunkAndViscera": "subtopics.trunkandviscera",
  
  // Subcategories from custom-tutor MENU_DATA
  "Brain": "subtopics.brain",
  "LarynxPharynx": "subtopics.larynxpharynx",
  "Ear": "subtopics.ear",
  "BasalGanglia": "subtopics.basalganglia",
  "SalivaryGland": "subtopics.salivarygland",
  "H&NVascular": "subtopics.hnvascular",
  "Lobes": "subtopics.lobes",
  "Skull/Vault": "subtopics.skullvault",
  "LymphNodes": "subtopics.lymphnodes", 
  "Ventricles": "subtopics.ventricles",
  "LimbicSystem": "subtopics.limbicsystem",
  "Diencephalon": "subtopics.diencephalon",
  "CircmVentOrgans": "subtopics.circmventorgans",

  "General": "subtopics.general", 
  "Musculoskeletal": "subtopics.musculoskeletal",
  "Glands": "subtopics.glands",
  "Hematopoietic": "subtopics.hematopoietic",
  "Organs": "subtopics.organs",
  "Muscles": "subtopics.muscles",
  "SoftTissue": "subtopics.softtissue",
  "Divisions": "subtopics.divisions",
  "EndocrineGland": "subtopics.endocrinegland",
  "Endocrine": "subtopics.endocrine",
  "Esophagus": "subtopics.esophagus",
  "Heart": "subtopics.heart",
  "Thorax": "subtopics.thorax",
  "Lungs": "subtopics.lungs",
  "ThoraxMisc": "subtopics.thoraxmisc",
  "MajorVessels": "subtopics.majorvessels",
  "Cavities": "subtopics.cavities",
};