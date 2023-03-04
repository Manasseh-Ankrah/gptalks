import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks';
import { ChatMessage } from 'types/chat';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Icon } from '@rneui/base';
import * as Animatable from 'react-native-animatable';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';

type Props = {
  item: ChatMessage;
  showSender?: boolean;
  disabled?: boolean;
  onShare?: (item: ChatMessage) => void;
  selected?: boolean;
};

const ChatBubble = ({
  item,
  showSender,
  disabled,
  onShare,
  selected,
}: Props) => {
  const { Fonts, Common, Colors, Layout } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  const [showTooltip, setShowTooltip] = useState(false);
  const [startClosing, setStartClosing] = useState(false);

  const toast = useToast();

  const color = item.sender === 'user' ? Colors.light : Colors.dark;
  const alignment = item.sender === 'user' ? 'flex-end' : 'flex-start';

  const renderTime = () => {
    return (
      <View
        style={[
          {
            alignItems: alignment,
          },
        ]}
      >
        <Text
          style={[
            Fonts.textSmall,
            {
              fontSize: 10,
            },
          ]}
        >
          {moment(item.date).format('HH:mm a')}
        </Text>
      </View>
    );
  };

  const onPress = () => {
    if (showTooltip) {
      return setStartClosing(true);
    }
    setShowTooltip(true);
  };

  const onCopy = () => {
    Clipboard.setString(item.message);
    toast.show('Copied to clipboard');
  };

  return (
    <Animatable.View
      animation={item.sender === 'user' ? 'bounceInRight' : 'bounceInLeft'}
      duration={300}
    >
      <TouchableOpacity
        style={[item.sender === 'user' ? Common.userBubble : Common.botBubble]}
        disabled={disabled}
        activeOpacity={0.8}
        onLongPress={() => {
          if (onShare) {
            onShare(item);
          }
        }}
        onPress={() => {
          onPress();
        }}
      >
        {showSender && (
          <Text
            style={[
              Fonts.textSmall,
              {
                color,
                marginBottom: 5,
              },
              Fonts.textBold,
            ]}
            numberOfLines={1}
          >
            {item.sender === 'user' ? user?.name : 'ChatGPT'}
          </Text>
        )}

        <Text
          style={[
            Fonts.textSmall,
            {
              color,
            },
          ]}
        >
          {item.message}
        </Text>

        {showTooltip && (
          <Animatable.View
            style={[
              {
                alignItems: alignment,
                marginVertical: 5,
              },
            ]}
            animation={startClosing ? 'zoomOut' : 'zoomIn'}
            onAnimationEnd={() => {
              if (startClosing) {
                setShowTooltip(false);
                setStartClosing(false);
              }
            }}
            duration={300}
          >
            <View
              style={[Layout.row, Layout.alignItemsCenter, Common.chatMenu]}
            >
              <TouchableOpacity
                style={[Common.chatMenuIcon]}
                onPress={() => {
                  if (onShare) {
                    onShare(item);
                  }
                  onPress();
                }}
              >
                <Icon
                  name="check-circle"
                  type="font-awesome"
                  size={35}
                  color={selected ? Colors.success : Colors.dark}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[Common.chatMenuIcon]}
                onPress={() => {
                  onCopy();
                  onPress();
                }}
              >
                <Icon
                  name="copy"
                  size={30}
                  color={Colors.dark}
                  type="feather"
                />
              </TouchableOpacity>
            </View>
          </Animatable.View>
        )}

        {selected && (
          <Icon
            name="check-circle"
            type="font-awesome"
            size={20}
            color={item.sender === 'user' ? Colors.grayLighter : Colors.primary}
            containerStyle={{
              borderRadius: 100,
              padding: 5,
              position: 'absolute',
              bottom: -10,
              right: 0,
            }}
          />
        )}
      </TouchableOpacity>

      {renderTime()}
    </Animatable.View>
  );
};

ChatBubble.defaultProps = {
  showSender: false,
  disabled: false,
  onShare: () => {},
  selected: false,
};

export default ChatBubble;
