clinician_types = [
    "Regional Anesthesia",
    "Cardiothoracic Surgery",
    "Emergency Medicine",
    "General Surgery",
    "Internal Medicine",
    "Pediatric Surgery",
    "Neurosurgery",
    "Orthopedic Surgery",
    "Plastic Surgery",
    "Obstetrics And Gynecology",
    "Urology",
    "Radiology",
    "Pathology",
    "Anesthesiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Nephrology",
    "Ophthalmology",
    "Psychiatry"
]

clinician_types.each do |name|
    ClinicianType.find_or_create_by!(name: name)
end

AiModel.find_or_create_by!(name: "NeuroMapAI", description: "NeuroMapAI is an advanced AI model designed to assist anesthesiologists in identifying optimal nerve block sites in real-time using ultrasound imaging. Leveraging deep learning and anatomical segmentation, it overlays nerve pathways, estimates local anesthetic spread, and suggests needle trajectories — reducing block failure rates and improving patient safety.", clinician_type_id: 1)
AiModel.find_or_create_by!(name: "DoseDex", description: "DoseDex is a smart AI model that calculates and adjusts local anesthetic dosing for regional blocks based on patient-specific variables like weight, age, comorbidities, and procedural type. It integrates EHR data and prior block outcomes to suggest the most effective dosing strategy while minimizing toxicity risk and maximizing analgesic duration.", clinician_type_id: 1)
AiModel.find_or_create_by!(name: "ThoracoPilot", description: "ThoracoPilot is an intelligent intraoperative assistant designed for cardiothoracic surgeons. It analyzes real-time imaging (CT, MRI, and intraoperative video), predicts anatomical variations, and simulates surgical outcomes such as graft flow or valve dynamics. The model offers step-by-step visual guidance during complex procedures like CABG or valve replacement, enhancing precision and reducing intraoperative risk.", clinician_type_id: 2)
AiModel.find_or_create_by!(name: "RapidTriageX", description: "RapidTriageX is a high-speed AI triage engine built for emergency departments. It processes patient vitals, speech input, facial cues, and EHR history within seconds of arrival to assign acuity levels, flag red-zone risks (like sepsis or stroke), and recommend initial diagnostics. The model continuously updates its assessment as new data streams in, helping ED teams prioritize care with unmatched speed and accuracy.", clinician_type_id: 3)

