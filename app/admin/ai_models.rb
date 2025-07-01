ActiveAdmin.register AiModel do
  permit_params :fine_tune_data_format, :allow_fine_tune
  actions :all, except: [ :new, :destroy, :create ]

  filter :id
  filter :name
  filter :clinician_type
  filter :allow_fine_tune
  filter :base_model

  index do
    id_column
    column :name
    column :clinician_type
    column :allow_fine_tune
    column :base_model
    actions
  end

  form do |f|
    f.semantic_errors
    f.inputs do
      f.input :fine_tune_data_format
      f.input :allow_fine_tune
    end
    f.actions
  end
end
