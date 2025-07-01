# app/channels/conversation_channel.rb
class ConversationChannel < ApplicationCable::Channel
  def subscribed
    conversation = Conversation.find_by(id: params[:conversation_id])
    if conversation
      stream_for conversation
      puts "Client subscribed to ConversationChannel for conversation_id: #{params[:conversation_id]}"
    else
      reject
      puts "Subscription rejected for non-existent conversation_id: #{params[:conversation_id]}"
    end
  end

  def unsubscribed
    # Any cleanup needed when the user leaves the page
    puts "Client unsubscribed from ConversationChannel for conversation_id: #{params[:conversation_id]}"
  end
end

