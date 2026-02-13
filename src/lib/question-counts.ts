
// This file contains the static question counts for UI display purposes.
// It is generated based on the latest available data to provide users with
// an accurate view of the question bank's size and distribution.

export interface MenuData {
  main_localization: Record<string, Record<string, number>>; // MainCat -> Difficulty -> Count
  sub_main_location: Record<string, Record<string, Record<string, number>>>; // MainCat -> SubCat -> Difficulty -> Count
  total_by_main_cat: Record<string, number>; // MainCat -> Total Count
  total_by_sub_cat: Record<string, Record<string, number>>; // MainCat -> SubCat -> Total Count
}

export const MENU_DATA: MenuData = {
    "main_localization": {
        "Head": {
            "Easy": 1870,
            "Advanced": 839
        },
        "Spine": {
            "Easy": 994,
            "Advanced": 312
        },
        "General": {
            "Easy": 305,
            "Advanced": 80
        },
        "Neck": {
            "Easy": 781,
            "Advanced": 351
        }
    },
    "sub_main_location": {
        "Head": {
            "Tumors": {
                "Easy": 154,
                "Advanced": 65
            },
            "NeurodegenDementiaDemyelinating": {
                "Easy": 277,
                "Advanced": 188
            },
            "Other": {
                "Easy": 141,
                "Advanced": 67
            },
            "Trauma": {
                "Easy": 496,
                "Advanced": 100
            },
            "GeneticDevMetabolic": {
                "Easy": 193,
                "Advanced": 81
            },
            "Anatomy": {
                "Easy": 269,
                "Advanced": 54
            },
            "InfectionandInflammation": {
                "Easy": 67,
                "Advanced": 44
            },
            "Vascular": {
                "Easy": 201,
                "Advanced": 99
            },
            "CranialNerves": {
                "Easy": 14,
                "Advanced": 50
            },
            "Neuroimaging": {
                "Easy": 142,
                "Advanced": 67
            },
            "OrbitandEye": {
                "Easy": 90,
                "Advanced": 6
            },
            "TreatmentManagement": {
                "Easy": 10,
                "Advanced": 10
            },
            "Pharmacology": {
                "Easy": 4,
                "Advanced": 2
            },
            "Pathophysiology": {
                "Easy": 4,
                "Advanced": 2
            },
            "Clinical Assessment": {
                "Easy": 4,
                "Advanced": 2
            },
            "Interventional Procedures": {
                "Easy": 4,
                "Advanced": 2
            }
        },
        "Spine": {
            "AnatomyRegions": {
                "Easy": 87,
                "Advanced": 18
            },
            "TreatmentManagement": {
                "Easy": 57,
                "Advanced": 18
            },
            "ImagingModalitiesFeatures": {
                "Easy": 172,
                "Advanced": 37
            },
            "PathologiesConditions": {
                "Easy": 260,
                "Advanced": 188
            },
            "NeoplasmsTumors": {
                "Easy": 369,
                "Advanced": 42
            },
            "ClinicalPresentationSymptoms": {
                "Easy": 47,
                "Advanced": 9
            },
            "Clinical Assessment": {
                "Easy": 1,
                "Advanced": 0
            },
            "Interventional Procedures": {
                "Easy": 1,
                "Advanced": 0
            },
            "Anatomy": {
                "Easy": 0,
                "Advanced": 0
            },
            "Tumors": {
                "Easy": 0,
                "Advanced": 0
            }
        },
        "General": {
            "GenMuscStruct": {
                "Easy": 212,
                "Advanced": 40
            },
            "HeadNeckCNS": {
                "Easy": 81,
                "Advanced": 38
            },
            "TrunkAndViscera": {
                "Easy": 3,
                "Advanced": 1
            },
            "Other": {
                "Easy": 7,
                "Advanced": 1
            },
            "TreatmentManagement": {
                "Easy": 1,
                "Advanced": 0
            },
            "Anatomy": {
                "Easy": 1,
                "Advanced": 0
            }
        },
        "Neck": {
            "OralOropharynx": {
                "Easy": 298,
                "Advanced": 144
            },
            "NasalSinus": {
                "Easy": 59,
                "Advanced": 13
            },
            "SenseHeadNeckReg": {
                "Easy": 242,
                "Advanced": 137
            },
            "GlandLymphatic": {
                "Easy": 175,
                "Advanced": 50
            },
            "Other": {
                "Easy": 6,
                "Advanced": 6
            },
            "Tumors": {
                "Easy": 1,
                "Advanced": 1
            }
        }
    },
    "total_by_main_cat": {
        "Head": 2709,
        "Spine": 1306,
        "General": 385,
        "Neck": 1132
    },
    "total_by_sub_cat": {
        "Head": {
            "Tumors": 219,
            "NeurodegenDementiaDemyelinating": 465,
            "Other": 208,
            "Trauma": 596,
            "GeneticDevMetabolic": 274,
            "Anatomy": 323,
            "InfectionandInflammation": 111,
            "Vascular": 300,
            "CranialNerves": 64,
            "Neuroimaging": 209,
            "OrbitandEye": 96,
            "TreatmentManagement": 20,
            "Pharmacology": 6,
            "Pathophysiology": 6,
            "Clinical Assessment": 6,
            "Interventional Procedures": 6
        },
        "Spine": {
            "AnatomyRegions": 105,
            "TreatmentManagement": 75,
            "ImagingModalitiesFeatures": 209,
            "PathologiesConditions": 448,
            "NeoplasmsTumors": 411,
            "ClinicalPresentationSymptoms": 56,
            "Clinical Assessment": 1,
            "Interventional Procedures": 1,
            "Anatomy": 0,
            "Tumors": 0
        },
        "General": {
            "GenMuscStruct": 252,
            "HeadNeckCNS": 119,
            "TrunkAndViscera": 4,
            "Other": 8,
            "TreatmentManagement": 1,
            "Anatomy": 1
        },
        "Neck": {
            "OralOropharynx": 442,
            "NasalSinus": 72,
            "SenseHeadNeckReg": 379,
            "GlandLymphatic": 225,
            "Other": 12,
            "Tumors": 2
        }
    }
};

    