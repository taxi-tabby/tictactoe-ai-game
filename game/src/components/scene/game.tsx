"use client"

import { use, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as tf from '@tensorflow/tfjs';
import Lottie from "lottie-react";
import useSound from 'use-sound';
import { Swiper, SwiperSlide } from 'swiper/react';
import * as Dialog from "@radix-ui/react-dialog";


import assetLoadingAnimation from './assetLoad.json';
import MonitorComponent from "../component/monitorComponent";
import { AudioPlayer, AudioManager } from "../../classes/audio";
import { ImageLoader } from "../../classes/image";

import assetList from '../../assets.json';


import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';


import { QuestionMarkIcon } from "@radix-ui/react-icons";
import { Table } from "@radix-ui/themes";


export default function GameStartScreen() {
	const [isSFXMuted, setIsSFXMuted] = useState(false);
	const [isBGMMuted, setIsBGMMuted] = useState(false);

	const [sceneName, setSceneName] = useState('loading');
	const [loadingStartFlag, setLoadingStartFlag] = useState(false);
	const [loadingTextAnimationFlag, setLoadingTextAnimationFlag] = useState(false);
	const [loadingTextAnimationText, setLoadingTextAnimationText] = useState('');

	const [totalLoadCount, setTotalLCount] = useState(0);
	const [loadCount, setLoadCount] = useState(0);

	const audioLoader = useRef<AudioManager | null>(null);
	const imageLoader = useRef<ImageLoader | null>(null);

	const [modalOpenWhatIsThis, setModalOpenWhatIsThis] = useState(false);
	const [modalOpenLicense, setModalOpenLicense] = useState(false);


	const [gameStatusPaused, setGameStatusPaused] = useState(false);



	function notready() {
		alert('아직 한참 개발 중.');
	}

	let isTransitioning = false;
	function gotoScene(scene: string) {
		if (isTransitioning) return;
		isTransitioning = true;
		setTimeout(() => {
			setSceneName(scene);
			isTransitioning = false;
		}, 230);
	}


	//화면 전환 시 처리
	useEffect(() => {

		if (sceneName === 'game') {
			// bgmAudioRef.current?.pause();
			audioLoader.current?.stop('main_bgm');
			setGameStatusPaused(false);
			console.log("game bgm stop!");
		}

		if (sceneName === 'main') {
			// bgmAudioRef.current?.play();
			audioLoader.current?.play('main_bgm');
			console.log("main bgm run!");
		}
	}, [sceneName]);


	useEffect(() => {

		async function assetLoading() {
			//관리자 생성
			if (!audioLoader.current) audioLoader.current = new AudioManager();
			if (!imageLoader.current) imageLoader.current = new ImageLoader();

			setTotalLCount(assetList.images.length + assetList.audio.length);

			for (const asset of assetList.images) {
				await imageLoader.current.loadImage(asset.key, asset.path);
				setLoadCount((prev) => prev + 1);
			}
			for (const asset of assetList.audio) {
				await audioLoader.current.addAudio(asset.key, asset.path, { loop: asset.loop ?? false, volume: asset.volume ?? 1.0 });
				setLoadCount((prev) => prev + 1);
			}

		}


		async function load() {
			if (sceneName === 'loading' && loadingTextAnimationFlag === false) {

				const interval = setInterval(() => {
					setLoadingTextAnimationText((prev) => {
						if (prev === '...') return '.';
						if (prev === '..') return '...';
						if (prev === '.') return '..';
						return '.';
					});
				}, 333);


				await assetLoading();
				console.log('loading');


				setTimeout(() => {
					clearInterval(interval);
					gotoScene('main');
				}, 680);
			}
		}

		if (loadingStartFlag === true) {
			load();
			setLoadingTextAnimationFlag(true);
		}
	}, [sceneName, loadingTextAnimationFlag, loadingStartFlag]);

	return (
		<>
			<div className="overflow-hidden w-full h-full bg-black">
				<AnimatePresence>
					{sceneName === 'loading' && (
						<motion.div
							key="scene-loading"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.5, }}
						>
							<MonitorComponent>
								<div className="w-full h-full flex flex-col items-center justify-center">
									{
										(loadingStartFlag === false) ? (
											<button className="px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full text-[20px] font-bold shadow-lg transform hover:scale-105 transition duration-500 ease-in-out" onClick={() => setLoadingStartFlag(true)}>
												Start Loading
											</button>
										) : (
											<>
												<Lottie animationData={assetLoadingAnimation} />
												<div className="px-4 py-2 text-[14px] text-white text-center">Loading{loadingTextAnimationText}</div>
												<motion.div
													className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden"
													initial={{ width: 0 }}
													animate={{ width: `${(loadCount / totalLoadCount) * 100}%` }}
													transition={{ duration: 0.5, ease: "easeInOut" }}
												>
													<motion.div
														className="bg-blue-600 h-4 rounded-full"
														initial={{ scaleX: 0 }}
														animate={{ scaleX: 1 }}
														transition={{ duration: 0.5, ease: "easeInOut" }}
													></motion.div>
												</motion.div>
												<motion.div
													className="px-4 py-2 text-[14px] text-white text-center"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ duration: 0.5, ease: "easeInOut" }}
												>
													{loadCount} / {totalLoadCount}
												</motion.div>
											</>
										)
									}

								</div>
							</MonitorComponent>
						</motion.div>
					)}

					{sceneName === 'game' && (
						<motion.div
							key="scene-game"
							initial={{ opacity: 0, y: -100 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -100 }}
							transition={{ duration: 0.45, ease: "backInOut", }}
						>
							<MonitorComponent>
								<div className="flex justify-between w-full h-full z-[2]">

									{gameStatusPaused && (
										<div className="flex flex-col w-full">

											<div className="flex justify-end">
											</div>

											<div className="flex flex-col items-center justify-center w-full h-full space-y-6 p-10">
												<motion.div
													className="text-[40px] font-bold text-yellow-500 "
													animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
													transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
												>
													PAUSED
												</motion.div>

												<button onClick={() => setGameStatusPaused(false)} className="px-6 py-3 text-white bg-green-600 rounded-lg text-[18px] font-semibold shadow-md hover:bg-green-700 transition duration-300 ease-in-out">
													Continue
												</button>
												<button onClick={() => gotoScene('main')} className="px-6 py-3 text-white bg-red-600 rounded-lg text-[18px] font-semibold shadow-md hover:bg-red-700 transition duration-300 ease-in-out">
													Quit
												</button>
											</div>

										</div>
									)}
									{!gameStatusPaused && (
										<div className="flex flex-col w-full">

											<div className="flex justify-end">
												<button className="px-4 py-2 mt-[10px] mr-[10px] font-bold text-[18px] text-white hover:underline transition duration-300" onClick={() => setGameStatusPaused(true)}>
													Pause
												</button>
											</div>
											<div className="flex flex-col items-center justify-center w-full h-full space-y-6 p-10">

												<div className="grid grid-cols-3 gap-2 w-[300px] h-[300px] z-[1]">
													{Array.from({ length: 9 }).map((_, index) => (
														<div
															key={index}
															className="flex items-center justify-center w-full h-full border border-gray-500 text-2xl font-bold text-white"
														>
															{/* Add your cell content here */}
															X/O
														</div>
													))}
												</div>

											</div>
										</div>
									)}


								</div>
							</MonitorComponent>
						</motion.div>
					)}


					{sceneName === 'main' && (
						<motion.div
							key="scene-main"
							initial={{ opacity: 0, y: -100 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -100 }}
							transition={{ duration: 0.45, ease: "backInOut", }}
						>
							<MonitorComponent>

								<Dialog.Root open={modalOpenWhatIsThis}>
									<Dialog.Portal>
										<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
										<Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
											<motion.div
												key={"modal-what-is-this"}
												initial={{ opacity: 0, y: 50 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 50 }}
												transition={{ duration: 0.3 }}
												className="p-6 rounded-lg shadow-lg w-[900px] bg-white"
											>

												<Dialog.Title className="text-lg font-bold">What is this?</Dialog.Title>
												<Dialog.Description className="text-gray-600">
													<Table.Root className="w-full border border-gray-300 rounded-lg shadow-md" size={"3"} variant="surface" layout={"auto"}>
														<Table.Header className="bg-gray-100">
															<Table.Row>
																<Table.ColumnHeaderCell className="font-semibold text-gray-700 text-lg py-4">Section</Table.ColumnHeaderCell>
																<Table.ColumnHeaderCell className="font-semibold text-gray-700 text-lg py-4">Details</Table.ColumnHeaderCell>
															</Table.Row>
														</Table.Header>

														<Table.Body>
															<Table.Row className="hover:bg-gray-50">
																<Table.RowHeaderCell className="font-medium text-gray-600 text-base py-3">Overview</Table.RowHeaderCell>
																<Table.Cell className="text-gray-600 text-base py-3 leading-relaxed">
																	This project utilizes a machine learning model trained with TensorFlow to create a Tic-Tac-Toe game with special rules. <br />
																	The AI model is designed to play optimally by analyzing data from previous games and<br />
																	applying unique game rules to enhance the gameplay experience.
																</Table.Cell>
															</Table.Row>

															<Table.Row className="hover:bg-gray-50">
																<Table.RowHeaderCell className="font-medium text-gray-600 text-base py-3">Training Process</Table.RowHeaderCell>
																<Table.Cell className="text-gray-600 text-base py-3 leading-relaxed">
																	<ul className="list-disc list-inside">
																		<li>
																			<strong>Data Collection:</strong> The dataset consists of
																			500,000 Tic-Tac-Toe game records.
																		</li>
																		<li>
																			<strong>Preprocessing:</strong> The JSON game records are
																			normalized into structured NumPy arrays.
																		</li>
																		<li>
																			<strong>Training:</strong> A neural network is trained using{" "}
																			<i>TensorFlow Keras</i> to predict the best possible moves.
																		</li>
																	</ul>
																</Table.Cell>
															</Table.Row>

															<Table.Row className="hover:bg-gray-50">
																<Table.RowHeaderCell className="font-medium text-gray-600 text-base py-3">Model Input & Output</Table.RowHeaderCell>
																<Table.Cell className="text-gray-600 text-base py-3 leading-relaxed">
																	<ul className="list-disc list-inside">
																		<li>
																			<strong>Input:</strong> A 1D array of size 9 representing the
																			board state.
																		</li>
																		<li>
																			<strong>Output:</strong> The best position (0-8) for the next
																			move.
																		</li>
																	</ul>
																</Table.Cell>
															</Table.Row>

															<Table.Row className="hover:bg-gray-50">
																<Table.RowHeaderCell className="font-medium text-gray-600 text-base py-3">Game Features</Table.RowHeaderCell>
																<Table.Cell className="text-gray-600 text-base py-3 leading-relaxed">
																	<ul className="list-disc list-inside">
																		<li>
																			Play against an <i>AI opponent</i> with different difficulty
																			levels.
																		</li>
																		<li>Supports only <i>single play</i> mode.</li>
																		<li>
																			Enhanced <i>graphics</i> and <i>sound effects</i> for an
																			immersive experience.
																		</li>
																	</ul>
																</Table.Cell>
															</Table.Row>

															<Table.Row className="hover:bg-gray-50">
																<Table.RowHeaderCell className="font-medium text-gray-600 text-base py-3">License</Table.RowHeaderCell>
																<Table.Cell className="text-gray-600 text-base py-3 leading-relaxed">
																	<i>MIT License</i> – Open source and free to use.
																</Table.Cell>
															</Table.Row>
														</Table.Body>
													</Table.Root>

													<button onClick={() => setModalOpenWhatIsThis(false)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
														Close
													</button>

												</Dialog.Description>

											</motion.div>
										</Dialog.Content>
									</Dialog.Portal>
								</Dialog.Root>

								<Dialog.Root open={modalOpenLicense}>
									<Dialog.Portal>
										<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
										<Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
											<motion.div
												key={"modal-license"}
												initial={{ opacity: 0, y: 50 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 50 }}
												transition={{ duration: 0.3 }}
												className="p-6 rounded-lg shadow-lg w-[900px] bg-white"
											>

												<Dialog.Title className="text-lg font-bold">License</Dialog.Title>
												<Dialog.Description className="text-gray-600">
													<Table.Root className="w-full border border-gray-300 rounded-lg shadow-md" size={"3"} variant="surface" layout={"auto"}>

														<Table.Header className="bg-gray-100">
															<Table.Row>
																<Table.ColumnHeaderCell className="font-semibold text-gray-700 text-lg py-4">Section</Table.ColumnHeaderCell>
																<Table.ColumnHeaderCell className="font-semibold text-gray-700 text-lg py-4">Details</Table.ColumnHeaderCell>
															</Table.Row>
														</Table.Header>

														<Table.Body>


															<Table.Row className="hover:bg-gray-50">
																<Table.RowHeaderCell className="font-medium text-gray-600 text-base py-3">Libraries</Table.RowHeaderCell>
																<Table.Cell className="text-gray-600 text-base py-3 leading-relaxed">
																	<ul className="list-disc list-inside">
																		<li><strong>React</strong></li>
																		<li><strong>Framer Motion</strong></li>
																		<li><strong>TensorFlow.js</strong></li>
																		<li><strong>Lottie React</strong></li>
																		<li><strong>use-sound</strong></li>
																		<li><strong>Swiper</strong></li>
																		<li><strong>Radix UI:</strong> @radix-ui/react-icons, @radix-ui/themes, @radix-ui/react-dialog</li>
																		<li><strong>Testing Libraries:</strong> @testing-library/dom, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event</li>
																		<li><strong>TypeScript</strong></li>
																		<li><strong>Web Vitals</strong></li>
																	</ul>
																</Table.Cell>
															</Table.Row>

															<Table.Row className="hover:bg-gray-50">
																<Table.RowHeaderCell className="font-medium text-gray-600 text-base py-3">Fonts</Table.RowHeaderCell>
																<Table.Cell className="text-gray-600 text-base py-3 leading-relaxed">
																	<ul className="list-disc list-inside">
																		<li><strong>Custom Font:</strong> ArmWrestler</li>
																	</ul>
																</Table.Cell>
															</Table.Row>

															<Table.Row className="hover:bg-gray-50">
																<Table.RowHeaderCell className="font-medium text-gray-600 text-base py-3">Additional Tools</Table.RowHeaderCell>
																<Table.Cell className="text-gray-600 text-base py-3 leading-relaxed">
																	<ul className="list-disc list-inside">
																		<li><strong>Deeply Image Generator:</strong> Used for generating AI-based images.</li>
																		<li><strong>Suno AI:</strong> Utilized for advanced AI functionalities.</li>
																	</ul>
																</Table.Cell>
															</Table.Row>

														</Table.Body>

													</Table.Root>

													<button onClick={() => setModalOpenLicense(false)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
														Close
													</button>

												</Dialog.Description>
											</motion.div>
										</Dialog.Content>
									</Dialog.Portal>
								</Dialog.Root>


								<div className="flex justify-between w-full h-full z-[2]">



									<div className="flex flex-col space-y-4 pt-[60px] pl-[60px] bg-gradient-to-r from-black/[0.8] to-transparent">
										<motion.div
											className="mb-[30px]"
											animate={{ rotate: [0, 10, -10, 0] }}
											transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
										>
											<img src={imageLoader.current?.getImageAsBase64('logo')} alt="Logo image" title="AI Generated image :)" className="w-[160px]" />
										</motion.div>
										<motion.div whileHover={{ opacity: [1, 0.5, 1] }} whileTap={{ opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity }} className="px-2 py-1 text-white hover:bg-blue-700 text-[24px] cursor-pointer" onClick={() => gotoScene('game')}>Start Game</motion.div>
										<motion.div whileHover={{ opacity: [1, 0.5, 1] }} whileTap={{ opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity }} className="px-2 py-1 text-white hover:bg-blue-700 text-[24px] cursor-pointer" onClick={notready}>Settings</motion.div>
										<motion.div whileHover={{ opacity: [1, 0.5, 1] }} whileTap={{ opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity }} className="px-2 py-1 text-white hover:bg-blue-700 text-[24px] cursor-pointer" onClick={() => setModalOpenWhatIsThis(true)}>
											What is this?
										</motion.div>
										<motion.div whileHover={{ opacity: [1, 0.5, 1] }} whileTap={{ opacity: 1 }} transition={{ duration: 0.8, repeat: Infinity }} className="px-2 py-1 text-white hover:bg-blue-700 text-[24px] cursor-pointer" onClick={() => setModalOpenLicense(true)}>
											License
										</motion.div>
									</div>

									<div className="flex flex-col items-center justify-end h-full">
										<motion.div
											className="flex items-end justify-center h-full"
											animate={{ y: [0, -50, 0] }}
											transition={{ duration: 0.8, repeat: Infinity, ease: [0.445, 0.05, 0.55, 0.95] }} // easeInOutSine equivalent
										>
											<img src="./game/asset/image/cat(main).png_짜치니까_이거_쓰지말자ㅋㅋ" alt="아직 정해지지 않음" title="아직 정해지지 않음" className="" />
										</motion.div>
									</div>

								</div>
								<div className="absolute inset-0 z-[1]">
									<Swiper
										slidesPerView={1}
										spaceBetween={30}
										loop={true}
										effect={'fade'}
										autoplay={{
											delay: 2400,
											disableOnInteraction: false
										}}

										navigation={false}
										modules={[Autoplay, EffectFade, Pagination, Navigation]}
										className="w-full h-full"
									>
										{Array.from({ length: 31 }, (_, index) => index + 1)
											.sort(() => Math.random() - 0.5)
											.map((num) => (
												<SwiperSlide key={num}>
													<div
														className="w-full h-full bg-cover bg-center"
														style={{ backgroundImage: `url(${imageLoader.current?.getImageAsBase64(`main_bg_${num}`)})` }}
														title={`bg${num}`}
													></div>
												</SwiperSlide>
											))}
									</Swiper>
								</div>

							</MonitorComponent>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</>



	)
}

