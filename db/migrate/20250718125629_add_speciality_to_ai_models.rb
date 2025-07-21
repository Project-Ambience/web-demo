class AddSpecialityToAiModels < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_models, :speciality, :string
  end
end
