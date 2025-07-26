class FineTuneStatusChannel < ApplicationCable::Channel
  def subscribed
    stream_from "fine_tune_status_channel"
  end
end
