class ChangeAllowFineTuneDefaultInAiModels < ActiveRecord::Migration[8.0]
  def change
    change_column_default :ai_models, :allow_fine_tune, from: nil, to: false
  end
end
