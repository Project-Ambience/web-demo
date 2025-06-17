class Api::MessagesController < Api::ApplicationController
  before_action :set_conversation

  # POST /api/conversations/:conversation_id/messages
  def create
    # 1. Save the user's message
    user_message = @conversation.messages.new(message_params.merge(role: 'user'))
    
    unless user_message.save
      return render json: user_message.errors, status: :unprocessable_entity
    end

    # 2. Simulate a call to the AI model
    # In a real application, you would send user_message.content to your AI service
    # and get a response. Here, we'll just echo it back for demonstration.
    ai_response_content = "This is a simulated response to: '#{user_message.content}'"
    
    # 3. Save the AI's response
    ai_message = @conversation.messages.new(role: 'assistant', content: ai_response_content)

    unless ai_message.save
      # Handle error in saving AI message, though unlikely in this simulation
      return render json: ai_message.errors, status: :unprocessable_entity
    end
    
    # 4. Update conversation timestamp to bring it to the top of the history
    @conversation.touch

    # 5. Send the AI's message back to the frontend
    render json: ai_message, status: :created
  end

  private

  def set_conversation
    @conversation = Conversation.find(params[:conversation_id])
  end

  def message_params
    params.require(:message).permit(:content)
  end
end