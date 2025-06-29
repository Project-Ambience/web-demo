class CreateFineTuneTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :fine_tune_tasks do |t|
      t.string :title
      t.jsonb :parameters
      t.references :ai_model, null: false, foreign_key: true

      t.timestamps
    end
  end
end
