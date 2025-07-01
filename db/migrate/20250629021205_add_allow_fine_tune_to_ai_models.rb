class AddAllowFineTuneToAiModels < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_models, :allow_fine_tune, :boolean
  end
end
