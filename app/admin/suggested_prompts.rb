ActiveAdmin.register SuggestedPrompt do
  permit_params :prompt, :ai_model_id

  menu label: "Starting Tutorial Prompts"

  index title: "Starting Tutorial Prompts" do
    selectable_column
    id_column
    column :prompt
    column :ai_model
    column :created_at
    column :updated_at
    actions
  end
end
