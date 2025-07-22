class Api::InterRatersController < Api::ApplicationController
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
end
