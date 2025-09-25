/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { FunctionComponent, PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from 'react-native-svg';

export interface CircularProgressProps {
  /**
   * Size of the circular progress indicator.
   */
  size: number;
  /**
   * Stroke width of the circular progress indicator.
   */
  strokeWidth: number;
  /**
   * Progress value between 0 and 1.
   */
  progress: number;
  /**
   * Color of the progress indicator.
   */
  color: string;
  /**
   * Background color of the progress indicator.
   */
  backgroundColor: string;
  /**
   * Gap angle in degrees (default is 0, meaning no gap).
   */
  gapAngle: number;
}

/**
 * CircularProgress component for displaying a circular progress indicator.
 *
 * @param props - Props for the CircularProgress component.
 * @returns A React element representing the CircularProgress component.
 */
const CircularProgress: FunctionComponent<PropsWithChildren<CircularProgressProps>> = ({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor,
  children,
  gapAngle
}: PropsWithChildren<CircularProgressProps>) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Calculate the arc length (360 - gapAngle) degrees.
  const arcAngle = 360 - gapAngle;
  const circumference = (arcAngle / 360) * 2 * Math.PI * radius;

  // Start angle (gap centered at top).
  const startAngle = -90 + (gapAngle / 2);

  // Progress calculation.
  const progressOffset = circumference * (1 - progress);

  return (
    <View style={[{ width: size, height: size }, styles.container]}>
      <Svg width={size} height={size} style={[styles.svgContainer]}>
        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${2 * Math.PI * radius}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${center} ${center})`}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${2 * Math.PI * radius}`}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${center} ${center})`}
        />
      </Svg>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  svgContainer: {
    position: 'absolute'
  }
});

export default CircularProgress;
