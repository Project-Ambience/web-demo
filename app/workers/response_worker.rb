class ResponseWorker
  include Sneakers::Worker

  from_queue "inference_results",
             durable: true,
             ack: true,
             retry_max_times: 5,
             timeout_job_after: 10

  def work(raw_message)
    message_data = JSON.parse(raw_message, symbolize_names: true)
    conversation_id = message_data[:conversation_id]
    result = message_data[:result]
    conversation = Conversation.find(conversation_id)
    message = Message.create!(conversation: conversation, role: "assistant", content: result)

    conversation.awaiting_feedback!

    ActionCable.server.broadcast(
      "conversation_#{message.conversation_id}",
      { message: { id: message.id, role: message.role, content: message.content }, status: conversation.status }
    )

    ack!
  rescue => e
    reject!
  end
end
