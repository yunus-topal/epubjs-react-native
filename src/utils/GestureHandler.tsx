import React from "react"
import { DimensionValue, I18nManager, Platform, View } from "react-native"
import {
	GestureHandlerRootView,
	GestureDetector,
	Gesture,
	Directions,
	TouchableWithoutFeedback,
} from "react-native-gesture-handler"
import { TapPosition } from "src"

interface Props {
	width?: DimensionValue
	height?: DimensionValue
	onSingleTap: (position: TapPosition) => void
	onDoubleTap: () => void
	onSwipeLeft: () => void
	onSwipeRight: () => void
	onSwipeUp: () => void
	onSwipeDown: () => void
	onLongPress: () => void
	children: React.ReactNode
}

export function GestureHandler({
	width = "100%",
	height = "100%",
	onSingleTap,
	onDoubleTap,
	onSwipeLeft,
	onSwipeRight,
	onSwipeUp,
	onSwipeDown,
	onLongPress,
	children,
}: Props) {
	let lastTapPosition: TapPosition | null = null

	const singleTap = Gesture.Tap()
		.runOnJS(true)
		.maxDuration(250)
		.onStart((e) => {
			lastTapPosition = {
			x: e.x,
			y: e.y,
			absoluteX: e.absoluteX,
			absoluteY: e.absoluteY,
			}
			onSingleTap(lastTapPosition)
		})

	const doubleTap = Gesture.Tap()
		.runOnJS(true)
		.maxDuration(250)
		.numberOfTaps(2)
		.onStart(onDoubleTap)

	const longPress = Gesture.LongPress().runOnJS(true).onStart(onLongPress)

	const swipeLeft = Gesture.Fling()
		.runOnJS(true)
		.direction(I18nManager.isRTL ? Directions.RIGHT : Directions.LEFT)
		.onStart(onSwipeLeft)

	const swipeRight = Gesture.Fling()
		.runOnJS(true)
		.direction(I18nManager.isRTL ? Directions.LEFT : Directions.RIGHT)
		.onStart(onSwipeRight)

	const swipeUp = Gesture.Fling().runOnJS(true).direction(Directions.UP).onStart(onSwipeUp)

	const swipeDown = Gesture.Fling().runOnJS(true).direction(Directions.DOWN).onStart(onSwipeDown)

	let lastTap: number | null = null
	let timer: NodeJS.Timeout

	const handleDoubleTap = () => {
		if (lastTap) {
			onDoubleTap()
			clearTimeout(timer)
			lastTap = null
		} else {
			lastTap = Date.now()
			timer = setTimeout(() => {
			if (lastTapPosition) {
				onSingleTap(lastTapPosition)
			}
			lastTap = null
			clearTimeout(timer)
			}, 500)
		}
	}

	if (Platform.OS === "ios") {
		return (
			<GestureHandlerRootView style={{ flex: 1 }}>
				<GestureDetector
					gesture={Gesture.Exclusive(
						swipeLeft,
						swipeRight,
						swipeUp,
						swipeDown,
						longPress,
						doubleTap,
						singleTap,
					)}
				>
					<TouchableWithoutFeedback
						style={{ width, height }}
						onPress={() => Platform.OS === "ios" && handleDoubleTap()}
						onLongPress={() => Platform.OS === "ios" && onLongPress()}
					>
						{children}
					</TouchableWithoutFeedback>
				</GestureDetector>
			</GestureHandlerRootView>
		)
	}
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<GestureDetector
				gesture={Gesture.Exclusive(
					swipeLeft,
					swipeRight,
					swipeUp,
					swipeDown,
					longPress,
					doubleTap,
					singleTap,
				)}
			>
				<View style={{ width, height }}>{children}</View>
			</GestureDetector>
		</GestureHandlerRootView>
	)
}
