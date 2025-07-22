class Api::InterRatersController < Api::ApplicationController
  def create
    inter_rater = InterRater.new(inter_rater_params)

    if inter_rater.save
      render json: inter_rater, status: :created
    else
      render json: { errors: inter_rater.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def fine_tune_model
    @ai_model = AiModel.find(params[:ai_model_id])
    return unless @ai_model.is_fine_tune_model

    @conversations = Conversation
      .includes(:messages, :ai_model)
      .where(status: "completed", ai_model: @ai_model)

    response_data = @conversations.map do |convo|
      {
        id: convo.id,
        prompt: convo.messages.first.content,
        response: convo.messages.second.content,
        response_base_model: convo.messages.find { |m| m.role == "assistant-base-model" }.content,
        file_url: convo.file_url,
        file_name: convo.file_name
      }
    end

    render json: response_data
  end

  private

  def inter_rater_params
    params.require(:inter_rater).permit(
      :prompt,
      :first_response,
      :second_response,
      :file_url,
      :ai_model_id,
      :evaluation_category,
      :comment,
      :rating
    )
  end
end
