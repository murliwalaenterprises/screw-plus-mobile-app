import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

interface AppTextProps extends TextProps {
    variant?: keyof typeof Typography; // tiny, small, regular, ...
}

import { Typography } from '../../helper/Typography';

const AppText: React.FC<AppTextProps> = ({ variant = 'regular', style, children, ...props }) => {
    return (
        <RNText
            style={[{ fontSize: Typography[variant] }, style]}
            {...props}
        >
            {children}
        </RNText>
    );
};

export default AppText;
