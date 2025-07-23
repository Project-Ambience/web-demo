class AddFineTuningNotesToAiModel < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_models, :fine_tuning_notes, :string

    add_column :model_fine_tune_requests, :fine_tuning_notes, :string
  end
end
