class AiModelsController < ApplicationController
  def show
    @ai_model = AiModel.includes(:comments).find(params[:id])
  end
end
