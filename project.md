# Semestral project MTAA
- vytvorte vo dvojiciach mobilnu aplikaciu (iOS/ Android) podla Vasho zadania, ktore si zvolite na prvom cviceni.


## Mobile Application
- Output of the project is a mobile app created for iOS or Android. Applications must be able to be run and functional on the latest OS (Andorid 14, iOS 17.3), with backwards compatibility up to Android 10, iOS 15.


### Allowed technology
- Kotilin / Java (Android)
- Swift / Objective-C (iOS)
- Kotlin Multiplatform (cross-platform)
    - in form of shared UI (Jetpack Compose)
    - In form of separate native UI per platform
- Flutter (cross-platform)
- React Native (cross-platform)
- Unity (cross-platform)


### Functional needs
- Application must have atleast 5 functional screens (splash screen does not count). Each screen covers a concrete use-case.
- CRUD operations
- Communication with own backend by HTTP on principles of REST API


### Necessary parts of the project
Implementation needs to contain:
- user management (persistent authentification)
- support to work in offline
- support for real-time communication
- support for phone and tablet 
    - separate screens for devices
- support dark mode
- push notifications
- permission handling


### Necessary choosable parts of the project
Implementation needs to contain atleast 3 of these requirements:
- support for other devices
- accessibility
- support AR/VR
- integration of Firebase 
- location based service
- integration of another sensor
- background task scheduling
    - task is run in periodical intervals without the need of the application to be open


### Non-required parts and tasks
Bonus points:
- tests
- machine learning
- performance as a part of documentation


### Changes made
- switching frontend technology (flutter -> React-Native)
#### Folder structure
I have made the executivev decision to switch to React Native after couple of workshops during our class, which revolved around creating an app using React-Native.
Flutter is almost impossible to configure, and although I have previous experience, React is more widely used framework. Based on JavaScript, with which I have a lot of experience,
I think it is the best option we have. Second reason I made the decision is I use Windows laptop (I have MBP 2015, not sufficient enough), and plan to develop for iOS devices since I use one.
React-Native with Expo Go enables me to develop for iOS device and I can see the app in my phone!!!!

```
npx create-expo-app@latest
```
Potom si len zvolime meno pre nas projekt, ja som dal stuface. Nainstaluju sa dependencies a po zbuildeni staci len

```
cd stuface
npx expo start
```

Then I just scan the QR code with my phone and Expo Go opens, showing me the app.

*FOLDER STRUCTURE*
```
stuface
    >app
        layout.tsx
        home.tsx
        login.tsx
        register.tsx
        profile.tsx
        topics.tsx
        */ folder containing all of the screens....layout.tsx contains <Stack /> which is then wrapped in providers 
    >components
        */ folder for reusable components used within our app
    >hooks
        */ hooks for providers, helper functions,...
```

