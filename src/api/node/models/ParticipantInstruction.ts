/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ParticipantInstruction = {
    /**
     * Ex: <a href="https://www.amazon.com/Fitbit-Charge-Heart-Fitness-Wristband/dp/B01K9S260E/ref=as_li_ss_tl?ie=UTF8&qid=1493518902&sr=8-3&keywords=fitbit&th=1&linkCode=ll1&tag=quant08-20&linkId=b357b0833de73b0c4e935fd7c13a079e">Obtain Fitbit</a> and use it to record your Sleep Duration. Once you have a <a href="https://www.amazon.com/Fitbit-Charge-Heart-Fitness-Wristband/dp/B01K9S260E/ref=as_li_ss_tl?ie=UTF8&qid=1493518902&sr=8-3&keywords=fitbit&th=1&linkCode=ll1&tag=quant08-20&linkId=b357b0833de73b0c4e935fd7c13a079e">Fitbit</a> account, <a href="https://web.quantimo.do/#/app/import">connect your  Fitbit account at QuantiModo</a> to automatically import and analyze your data.
     */
    instructionsForCauseVariable?: string;
    /**
     * Ex: <a href="https://quantimo.do">Obtain QuantiModo</a> and use it to record your Overall Mood. Once you have a <a href="https://quantimo.do">QuantiModo</a> account, <a href="https://web.quantimo.do/#/app/import">connect your  QuantiModo account at QuantiModo</a> to automatically import and analyze your data.
     */
    instructionsForEffectVariable?: string;
}