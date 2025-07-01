ActiveAdmin.register ModelInstallRequest do
  permit_params :clinician_type_id, :name, :description, :keyword, :path

  filter :id
  filter :clinician_type_id
  filter :name
  filter :status
  filter :path

  form do |f|
    f.inputs do
      f.input :clinician_type
      f.input :name
      f.input :description
      f.input :keyword
      f.input :path
    end
    f.actions
  end
end
