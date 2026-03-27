import React, { useState, useEffect } from "react";
import { defineMessages, useIntl } from "react-intl";
import Panel from "app/components/Panel";
import FitText from "app/components/FitText";
import { WidgetProps, WidgetType, defaultThemeSchema } from "app/Widget";
import { Vector2 } from "app/utils/Vector2";
import { type } from "app/utils/Schema";

enum SessionType {
	Work,
	ShortBreak,
	LongBreak,
}

interface PomodoroProps {
	workMinutes: number;
	shortBreakMinutes: number;
	longBreakMinutes: number;
	sessionsBeforeLongBreak: number;
}

const messages = defineMessages({
	title: {
		defaultMessage: "Pomodoro Timer",
		description: "Pomodoro widget title",
	},
	description: {
		defaultMessage: "Focus timer with Pomodoro technique",
	},
	workMinutes: {
		defaultMessage: "Work duration (minutes)",
	},
	shortBreakMinutes: {
		defaultMessage: "Short break duration (minutes)",
	},
	longBreakMinutes: {
		defaultMessage: "Long break duration (minutes)",
	},
	sessionsBeforeLongBreak: {
		defaultMessage: "Sessions before long break",
	},
	work: {
		defaultMessage: "Work",
	},
	shortBreak: {
		defaultMessage: "Short Break",
	},
	longBreak: {
		defaultMessage: "Long Break",
	},
});

function Pomodoro(props: WidgetProps<PomodoroProps>) {
	const data = props.props;
	const intl = useIntl();

	const [isRunning, setIsRunning] = useState(false);
	const [sessionType, setSessionType] = useState(SessionType.Work);
	const [sessionsCompleted, setSessionsCompleted] = useState(0);
	const [timeLeft, setTimeLeft] = useState(data.workMinutes * 60);
	const [totalTime, setTotalTime] = useState(data.workMinutes * 60);

	// Timer effect
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isRunning && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
		} else if (timeLeft === 0 && isRunning) {
			moveToNextSession();
		}

		return () => clearInterval(interval);
	}, [isRunning, timeLeft]);

	const getSessionDuration = (session: SessionType): number => {
		switch (session) {
			case SessionType.Work:
				return data.workMinutes * 60;
			case SessionType.ShortBreak:
				return data.shortBreakMinutes * 60;
			case SessionType.LongBreak:
				return data.longBreakMinutes * 60;
		}
	};

	const getSessionLabel = (session: SessionType): string => {
		switch (session) {
			case SessionType.Work:
				return intl.formatMessage(messages.work);
			case SessionType.ShortBreak:
				return intl.formatMessage(messages.shortBreak);
			case SessionType.LongBreak:
				return intl.formatMessage(messages.longBreak);
		}
	};

	const moveToNextSession = () => {
		setIsRunning(false);

		if (sessionType === SessionType.Work) {
			const nextCompleted = sessionsCompleted + 1;
			setSessionsCompleted(nextCompleted);

			const nextSession =
				nextCompleted % data.sessionsBeforeLongBreak === 0
					? SessionType.LongBreak
					: SessionType.ShortBreak;

			setSessionType(nextSession);
			const duration = getSessionDuration(nextSession);
			setTimeLeft(duration);
			setTotalTime(duration);
		} else {
			setSessionType(SessionType.Work);
			const duration = getSessionDuration(SessionType.Work);
			setTimeLeft(duration);
			setTotalTime(duration);
		}
	};

	const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

	const handleStartPause = () => {
		setIsRunning(!isRunning);
	};

	const handleReset = () => {
		setIsRunning(false);
		setSessionType(SessionType.Work);
		setSessionsCompleted(0);
		const newTime = data.workMinutes * 60;
		setTimeLeft(newTime);
		setTotalTime(newTime);
	};

	// Update when props change
	useEffect(() => {
		if (!isRunning) {
			const newDuration = getSessionDuration(sessionType);
			setTimeLeft(newDuration);
			setTotalTime(newDuration);
		}
	}, [
		data.workMinutes,
		data.shortBreakMinutes,
		data.longBreakMinutes,
		isRunning,
		sessionType,
	]);

	return (
		<Panel {...props.theme} scrolling={false}>
			<div
				style={{
					padding: "1rem",
					textAlign: "center",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
				}}
			>
				{/* Session info */}
				<div style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "0.5rem" }}>
					<div>{getSessionLabel(sessionType)}</div>
					<div style={{ fontSize: "0.8rem" }}>
						Session {sessionsCompleted + 1}/{data.sessionsBeforeLongBreak}
					</div>
				</div>

				{/* Timer display */}
				<div
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<FitText>
						<div>{formatTime(timeLeft)}</div>
					</FitText>
				</div>

				{/* Progress bar */}
				<div
					style={{
						height: "4px",
						backgroundColor: "rgba(255, 255, 255, 0.2)",
						borderRadius: "2px",
						overflow: "hidden",
						marginBottom: "0.75rem",
					}}
				>
					<div
						style={{
							height: "100%",
							width: `${progressPercent}%`,
							backgroundColor:
								sessionType === SessionType.Work ? "#ff6b6b" : "#51cf66",
							transition: "width 0.3s ease",
						}}
					/>
				</div>

				{/* Controls */}
				<div
					style={{
						display: "flex",
						gap: "0.5rem",
						justifyContent: "center",
					}}
				>
					<button
						onClick={handleStartPause}
						style={{
							padding: "0.4rem 0.8rem",
							fontSize: "0.85rem",
							backgroundColor: isRunning ? "#ff8c8c" : "#4CAF50",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
							flex: 1,
						}}
					>
						{isRunning ? "Pause" : "Start"}
					</button>
					<button
						onClick={handleReset}
						style={{
							padding: "0.4rem 0.8rem",
							fontSize: "0.85rem",
							backgroundColor: "#666",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: "pointer",
						}}
					>
						Reset
					</button>
				</div>
			</div>
		</Panel>
	);
}

const widget: WidgetType<PomodoroProps> = {
	Component: Pomodoro,
	title: messages.title,
	description: messages.description,
	defaultSize: new Vector2(12, 8),
	initialProps: {
		workMinutes: 25,
		shortBreakMinutes: 5,
		longBreakMinutes: 15,
		sessionsBeforeLongBreak: 4,
	},
	initialTheme: {
		showPanelBG: true,
	},
	schema: {
		workMinutes: type.unit_number(messages.workMinutes, "min", undefined, 1, 60),
		shortBreakMinutes: type.unit_number(
			messages.shortBreakMinutes,
			"min",
			undefined,
			1,
			30
		),
		longBreakMinutes: type.unit_number(
			messages.longBreakMinutes,
			"min",
			undefined,
			5,
			60
		),
		sessionsBeforeLongBreak: type.unit_number(
			messages.sessionsBeforeLongBreak,
			"",
			undefined,
			1,
			10
		),
	},
	themeSchema: defaultThemeSchema,
};

export default widget;
