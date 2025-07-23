ActiveAdmin.register ModelInstallRequest do
  permit_params :clinician_type_id, :name, :description, :keyword, :path, :family, :parameter_size

  filter :id
  filter :clinician_type_id
  filter :name
  filter :status
  filter :path
  filter :family
  filter :parameter_size

  form do |f|
    f.inputs do
      f.input :clinician_type
      f.input :name
      f.input :description
      f.input :path
      f.input :family
      f.input :parameter_size
    end
    f.actions
  end
end
