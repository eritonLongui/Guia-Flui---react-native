import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { styles } from './Card.styles';

interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ title, description, children, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
};
export default Card;
