class CreateModelFineTuneRequests < ActiveRecord::Migration[8.0]
  def change
    create_table :model_fine_tune_requests do |t|
      t.string :name
      t.string :description
      t.references :ai_model, null: false, foreign_key: true
      t.references :clinician_type, null: false, foreign_key: true
      t.jsonb :parameters, default: {}
      t.integer :status

      t.timestamps
    end
  end
end
