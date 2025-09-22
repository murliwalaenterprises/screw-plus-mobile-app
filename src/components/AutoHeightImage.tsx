import React, { useEffect, useState } from "react";
import { Image, Dimensions } from "react-native";

interface AutoHeightImageProps {
    uri: string;
    width?: number; // optional, default screen width
    style?: object; // extra styles
    resizeMode?: "cover" | "contain" | "stretch" | "center";
}

const AutoHeightImage: React.FC<AutoHeightImageProps> = ({
    uri,
    width = Dimensions.get("window").width,
    style,
    resizeMode = "cover",
}) => {
    const [height, setHeight] = useState<number>(200); // default

    useEffect(() => {
        Image.getSize(
            uri,
            (imgWidth, imgHeight) => {
                const scaleFactor = imgWidth / width;
                const scaledHeight = imgHeight / scaleFactor;
                setHeight(scaledHeight);
            },
            () => {
                setHeight(200); // fallback agar size fetch na ho
            }
        );
    }, [uri, width]);

    return (
        <Image
            source={{ uri }}
            style={[{ width, height, resizeMode }, style]}
        />
    );
};

export default AutoHeightImage;
