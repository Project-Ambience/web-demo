class Api::MessagesController < Api::ApplicationController
  def create
    @conversation = Conversation.find(params[:conversation_id])

    unless @conversation.awaiting_prompt? || @conversation.awaiting_rejection_comment?
      return render json: { error: "This conversation is not accepting new messages." }, status: :unprocessable_entity
    end

    @message = @conversation.messages.new(content: params[:message][:content], role: "user")

    if @message.save
      uploaded_file = params[:message][:file]
      if uploaded_file.present? && !@conversation.file.attached?
        @conversation.file.attach(uploaded_file)
      end

      handle_few_shot_template_selection

      input_history = @conversation.reload.messages.map do |msg|
        { role: msg.role, content: msg.content }
      end

      MessagePublisher.publish({
        conversation_id: @conversation.id,
        file_url: @conversation.file_url,
        few_shot_template: @conversation.few_shot_template,
        input: input_history,
        base_model_path: @conversation.ai_model.path,
        adapter_path: @conversation.ai_model.adapter_path,
        speciality: @conversation.ai_model.speciality
      }, ENV["USER_PROMPT_QUEUE_NAME"])

      @conversation.awaiting_feedback!
      render json: @message, status: :created
    else
      render json: @message.errors, status: :unprocessable_entity
    end
  end

  private

  def handle_few_shot_template_selection
    template_id = params.dig(:message, :few_shot_template_id)
    return unless template_id.present? && @conversation.few_shot_template.blank?

    template = FewShotTemplate.includes(:examples).find_by(id: template_id)
    return unless template

    snapshot = {
      name: template.name,
      description: template.description,
      examples: template.examples.map { |ex| { input: ex.input, output: ex.output } }
    }
    
    @conversation.update(few_shot_template: snapshot)
  end
end
