class Api::InterRatersController < Api::ApplicationController
  def create
    inter_rater = InterRater.new(inter_rater_params)

    if inter_rater.save
      render json: inter_rater, status: :created
    else
      render json: { errors: inter_rater.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def response_pairs
    @inter_raters = InterRater.where(ai_model_id: params[:ai_model_id]).order(created_at: :desc)

    response_data = @inter_raters.map do |inter_rater|
      {
        id: inter_rater.id,
        first_conversation_id: inter_rater.first_conversation_id,
        first_conversation_ai_model_name: inter_rater.first_conversation.ai_model.name,
        first_conversation_base_prompt: inter_rater.first_conversation.base_prompt,
        first_conversation_first_response: inter_rater.first_conversation.first_response,
        first_conversation_file_url: inter_rater.first_conversation.file_url,
        first_conversation_file_name: inter_rater.first_conversation.file_name,
        first_conversation_few_shot_template: inter_rater.first_conversation.few_shot_template,
        first_conversation_cot: inter_rater.first_conversation.cot,
        second_conversation_id: inter_rater.second_conversation_id,
        second_conversation_ai_model_name: inter_rater.second_conversation.ai_model.name,
        second_conversation_base_prompt: inter_rater.second_conversation.base_prompt,
        second_conversation_first_response: inter_rater.second_conversation.first_response,
        second_conversation_file_url: inter_rater.second_conversation.file_url,
        second_conversation_file_name: inter_rater.second_conversation.file_name,
        second_conversation_few_shot_template: inter_rater.second_conversation.few_shot_template,
        second_conversation_cot: inter_rater.second_conversation.cot
      }
    end

    render json: response_data
  end

  private

  def inter_rater_params
    params.require(:inter_rater).permit(
      :first_conversation_id,
      :second_conversation_id,
      :ai_model_id
    )
  end
end
