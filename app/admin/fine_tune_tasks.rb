ActiveAdmin.register FineTuneTask do
  permit_params :title, :parameters, :ai_model_id
end
