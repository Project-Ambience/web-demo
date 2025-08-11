class AddFineTuneDataFormatCsvToAiModels < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_models, :fine_tune_data_format_csv, :string
  end
end
