ActiveAdmin.register SuggestedPrompt do
  permit_params :prompt, :ai_model_id

  menu label: "Starting Tutorial Prompts"
end
