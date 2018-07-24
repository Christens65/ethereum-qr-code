import QRCode from 'qrcode'

import defaultConfig from './defaultConfig'
import { encodeEthereumUri, decodeEthereumUri } from './uriProcessor'

/**
 * Main plugin logic
 */
class EthereumQRPlugin {
  /**
   *
   * Generates a data encode string
   *
   * @public
   * @param {Object} config
   * @returns String
   */
  toAddressString(config) {
    return this.produceEncodedAmount(config)
  }

  /**
   *
   * Draws QR code to canvas tag inside specified DOM selector
   *
   * @public
   * @param {Object} config
   * @returns Promise
   */
  toCanvas(config, options) {
    const generatedAmount = this.produceEncodedAmount(config, options)
    const parentEl = document.querySelector(options.selector)

    if (!options.selector || parentEl === null) {
      throw new Error('The canvas element parent selector is required when calling `toCanvas`')
    }

    return new Promise((resolve, reject) => {
      QRCode.toCanvas(generatedAmount, this.options, (err, canvas) => {
        if (err) return reject(err)

        parentEl.innerHTML = null
        parentEl.appendChild(canvas)
        canvas.setAttribute('style', `width: ${this.size}px`)

        return resolve({ amount: generatedAmount })
      })
    })
  }

  /**
   *
   * Generates DataURL for a QR code
   *
   * @public
   * @param {Object} config
   * @returns Promise
   */
  toDataUrl(config, options) {
    const generatedAmount = this.produceEncodedAmount(config, options)

    return new Promise((resolve, reject) => {
      QRCode.toDataURL(generatedAmount, this.options, (err, url) => {
        if (err) reject(err)

        resolve({
          dataURL: url,
          amount: generatedAmount,
        })
      })
    })
  }

  /**
   * implements backwards transformation encode query string to JSON
   *
   * @param {String} amountString
   */
  readStringToJSON(amountString) { // eslint-disable-line class-methods-use-this
    return decodeEthereumUri(amountString)
  }

  getJSON() {
    return JSON.stringify(this.readStringToJSON())
  }

  produceEncodedAmount(config, options) {
    this.assignPluguinAmounts(options)

    return encodeEthereumUri(config)
  }

  assignPluguinAmounts(request = {}) {
    const { options, size, toJSON, imgUrl } = request
    const qrSize = parseInt(size, 10)

    this.toJSON = !!toJSON
    this.size = (size && (qrSize > 0)) ? qrSize : defaultConfig.size
    this.imgUrl = imgUrl || false
    this.options = Object.assign({}, defaultConfig.options, options)
  }
}

export default EthereumQRPlugin
