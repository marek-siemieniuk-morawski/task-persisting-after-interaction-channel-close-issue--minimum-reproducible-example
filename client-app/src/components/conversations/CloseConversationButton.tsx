import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button } from "@twilio-paste/core";

import { actionCreators, AppState } from "../../store";
import { getTranslation } from "../../utils/localUtils";
import { ReduxConversation } from "../../store/reducers/convoReducer";
import { closeConversation } from "../../api";
import styles from "../../styles";
import { bindActionCreators } from "redux";
import { CONVERSATION_MESSAGES } from "../../constants";
import {
  successNotification,
  unexpectedErrorNotification,
} from "../../helpers";

interface CloseConversationButtonProps {
  convo: ReduxConversation;
}

const CloseConversationButton: React.FC<CloseConversationButtonProps> = (
  props: CloseConversationButtonProps
) => {
  const local = useSelector((state: AppState) => state.local);
  const closeConversationButton = getTranslation(local, "closeConversation");

  const dispatch = useDispatch();
  const { addNotifications } = bindActionCreators(actionCreators, dispatch);

  const handleCloseConversation = async () => {
    try {
      await closeConversation(props.convo.sid);
      successNotification({
        message: CONVERSATION_MESSAGES.CLOSED,
        addNotifications,
      });
    } catch (error) {
      unexpectedErrorNotification(error.message, addNotifications);
    }
  };

  return (
    <Box style={styles.addParticipantsButton}>
      <Button fullWidth variant="secondary" onClick={handleCloseConversation}>
        {closeConversationButton}
      </Button>
    </Box>
  );
};

export default CloseConversationButton;
