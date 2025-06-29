class AddFineTuneDataFormatToAiModels < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_models, :fine_tune_data_format, :jsonb, default: {}
  end
end
