class CreateAiModels < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_models do |t|
      t.string :name
      t.string :description
      t.references :clinician_type, null: false, foreign_key: true
      t.text :keywords, array: true, default: []

      t.timestamps
    end
  end
end
