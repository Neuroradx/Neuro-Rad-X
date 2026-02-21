// src/lib/infographic-registry.ts
/**
 * @file This file serves as the central registry for all component-based infographics.
 * To add a new infographic to the application, you only need to modify this file.
 *
 * Steps to add a new infographic:
 * 1. Create your infographic component in `/src/components/infographics/`.
 * 2. Import the new component at the top of this file.
 * 3. Add a new entry to the `COMPONENT_INFOGRAPHICS` array with its ID and title.
 * 4. Add a corresponding entry to the `COMPONENT_MAP` object, mapping the ID to the component.
 * 5. Important for charts: Always use theme variables for colors (e.g., `color: 'hsl(var(--chart-1))'`) in your chart configurations. Do not hardcode hex values, as this will break in dark mode.
 */

import type React from 'react';
import type { Infographic } from '@/types';

// 1. Import all infographic components
import PresInfographic from '@/components/infographics/PresInfographic';
import BrainLesionInfographic from '@/components/infographics/BrainLesionInfographic';
import NeuroimagingInfographic from '@/components/infographics/NeuroimagingInfographic';
import AcuteIschemicStrokeInfographic from '@/components/infographics/AcuteIschemicStrokeInfographic';
import StrokeSubtypesInfographic from '@/components/infographics/StrokeSubtypesInfographic';
import CerebralAmyloidAngiopathyInfographic from '@/components/infographics/CerebralAmyloidAngiopathyInfographic';
import LimbicEncephalitisInfographic from '@/components/infographics/LimbicEncephalitisInfographic';
import CerebralVenousSinusThrombosisInfographic from '@/components/infographics/CerebralVenousSinusThrombosisInfographic';
import SammpisTrialInfographic from '@/components/infographics/SammpisTrialInfographic';
import CerebralMicrobleedsInfographic from '@/components/infographics/CerebralMicrobleedsInfographic';
import CerebralCavernousMalformationInfographic from '@/components/infographics/CerebralCavernousMalformationInfographic';
import IntracranialHemorrhageInfographic from '@/components/infographics/IntracranialHemorrhageInfographic';
import QuantitativeAlcoholCnsInfographic from '@/components/infographics/QuantitativeAlcoholCnsInfographic';
import NeurocysticercosisInfographic from '@/components/infographics/NeurocysticercosisInfographic';
import OligodendrogliomaInfographic from '@/components/infographics/OligodendrogliomaInfographic';
import PinealTumorsInfographic from '@/components/infographics/PinealTumorsInfographic';
import PcnslInfographic from '@/components/infographics/PcnslInfographic';


// 2. Define the type for our infographic list
type InfographicInfo = Omit<Infographic, 'createdAt' | 'htmlContent'>;

// 3. Define the list of all component-based infographics
export const COMPONENT_INFOGRAPHICS: InfographicInfo[] = [
  {
    id: 'pres_infographic_component',
    title: 'PRES (Posterior Reversible Encephalopathy Syndrome)',
    categoryId: 'vascular',
    isComponent: true,
  },
  {
    id: 'brain_lesion_infographic_component',
    title: 'Differentiating Brain Lesions',
    categoryId: 'general_technique',
    isComponent: true,
  },
  {
    id: 'neuroimaging_infographic_component',
    title: 'Neuroimaging Modalities and ICH',
    categoryId: 'general_technique',
    isComponent: true,
  },
  {
    id: 'acute_ischemic_stroke_infographic_component',
    title: 'Acute Ischemic Stroke: Perfusion Imaging',
    categoryId: 'vascular',
    isComponent: true,
  },
  {
    id: 'stroke_subtypes_infographic_component',
    title: 'Ischemic vs. Hemorrhagic Stroke',
    categoryId: 'vascular',
    isComponent: true,
  },
  {
    id: 'cerebral_amyloid_angiopathy_infographic_component',
    title: 'Cerebral Amyloid Angiopathy (CAA)',
    categoryId: 'microangiopathy',
    isComponent: true,
  },
  {
    id: 'limbic_encephalitis_infographic_component',
    title: 'Limbic Encephalitis: Diagnostic Criteria',
    categoryId: 'inflammatory_infectious_toxic',
    isComponent: true,
  },
  {
    id: 'cvst_infographic_component',
    title: 'Cerebral Venous Sinus Thrombosis (CVST)',
    categoryId: 'vascular',
    isComponent: true,
  },
  {
    id: 'sammpis_trial_infographic_component',
    title: 'A Critical Analysis of the SAMMPRIS Trial',
    categoryId: 'vascular',
    isComponent: true,
  },
  {
    id: 'cerebral_microbleeds_infographic_component',
    title: 'Cerebral Microbleeds: What Are They Telling Us?',
    categoryId: 'microangiopathy',
    isComponent: true,
  },
  {
    id: 'cerebral_cavernous_malformation_infographic',
    title: 'Cerebral Cavernous Malformation (CCM)',
    categoryId: 'vascular',
    isComponent: true,
  },
  {
    id: 'intracranial_hemorrhage_infographic',
    title: 'Intracranial Hemorrhage: A Breakdown by Etiology',
    categoryId: 'vascular',
    isComponent: true,
  },
  {
    id: 'quantitative_alcohol_cns_infographic',
    title: "Quantitative Analysis: Alcohol's Effects on the CNS",
    categoryId: 'inflammatory_infectious_toxic',
    isComponent: true,
  },
  {
    id: 'neurocysticercosis_infographic_component',
    title: 'Neurocysticercosis (NCC): Radiological Aspects',
    categoryId: 'inflammatory_infectious_toxic',
    isComponent: true,
  },
  {
    id: 'oligodendroglioma_infographic_component',
    title: 'IDH-Mutated, 1p/19q Codeleted Oligodendroglioma',
    categoryId: 'oncology',
    isComponent: true,
  },
  {
    id: 'pineal_tumors_infographic_component',
    title: 'Pineal Region Tumors: Radiological Aspects',
    categoryId: 'oncology',
    isComponent: true,
  },
  {
    id: 'pcnsl_infographic_component',
    title: 'Primary CNS Lymphoma (PCNSL)',
    categoryId: 'oncology',
    isComponent: true,
  },
];

// 4. Create the component map for the client-side rendering
export const COMPONENT_MAP: Record<string, React.ElementType> = {
  pres_infographic_component: PresInfographic,
  brain_lesion_infographic_component: BrainLesionInfographic,
  neuroimaging_infographic_component: NeuroimagingInfographic,
  acute_ischemic_stroke_infographic_component: AcuteIschemicStrokeInfographic,
  stroke_subtypes_infographic_component: StrokeSubtypesInfographic,
  cerebral_amyloid_angiopathy_infographic_component: CerebralAmyloidAngiopathyInfographic,
  limbic_encephalitis_infographic_component: LimbicEncephalitisInfographic,
  cvst_infographic_component: CerebralVenousSinusThrombosisInfographic,
  sammpis_trial_infographic_component: SammpisTrialInfographic,
  cerebral_microbleeds_infographic_component: CerebralMicrobleedsInfographic,
  cerebral_cavernous_malformation_infographic: CerebralCavernousMalformationInfographic,
  intracranial_hemorrhage_infographic: IntracranialHemorrhageInfographic,
  quantitative_alcohol_cns_infographic: QuantitativeAlcoholCnsInfographic,
  neurocysticercosis_infographic_component: NeurocysticercosisInfographic,
  oligodendroglioma_infographic_component: OligodendrogliomaInfographic,
  pineal_tumors_infographic_component: PinealTumorsInfographic,
  pcnsl_infographic_component: PcnslInfographic,
};
