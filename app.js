(()=>{
  const triggerName = "data-modal-trigger" // the attribute name that holds the modal name on the trigger element
  const modalAttrName = "data-modal-name" // the attribute name that holds the modal name on the modal element
  const modalActiveClass = "is-active" // added to modal when opened
  const activeModalTriggerAttrName = "data-associated-modal-open" // added to trigger when modal is open
  const getElementsFromAttr = ({attributeName, attributeValue, getAll}) => {
    if (!attributeName) return
    attributeValue = attributeValue || null
    getAll = getAll || false
    if (getAll && attributeValue) return document.querySelectorAll(`[${attributeName}="${attributeValue}"]`)
    if(getAll) return document.querySelectorAll(`[${attributeName}]`)
    if (attributeValue) return document.querySelector(`[${attributeName}="${attributeValue}"]`)
    return document.querySelector(`[${attributeName}]`)
  }
  /* @return {Boolean} */
  const isModalOpen = ({modalAttrName, modalName}) => {
    const modal = getElementsFromAttr({ attributeName:modalAttrName, attributeValue:modalName })
    if (!modal) return false
    return modal.classList.contains(modalActiveClass)
  }
  // add "data-associated-modal-open" to trigger so we can style it
  const toggleDataAttrOnModalTrigger = ({triggerName, modalName, toOpen}) => {
    return new Promise((resolve)=>{
      const trigger = getElementsFromAttr({ attributeName:triggerName, attributeValue:modalName })
      if (!trigger) return
      toOpen ? trigger.setAttribute(activeModalTriggerAttrName, true) : trigger.removeAttribute(activeModalTriggerAttrName)
      trigger.ariaExpanded = toOpen ? "true" : "false"
      resolve()
    })
  }
  // open modal
  const handleOpenModal = ({modalAttrName, modalName}) => {
    const modal = getElementsFromAttr({ attributeName:modalAttrName, attributeValue:modalName })
    if (!modal) return false
    modal.classList.add(modalActiveClass)
    toggleDataAttrOnModalTrigger({triggerName, modalName, toOpen: true})
    const allMenuItems = modal.querySelectorAll(
      '[role="menuitem"]'
    );
    allMenuItems[0].focus();
  }
  // close modal
  const handleCloseModal = ({modalAttrName, modalName}) => {
    return new Promise(async (resolve)=>{
      const modal = getElementsFromAttr({ attributeName:modalAttrName, attributeValue:modalName })
      if (!modal) return false
      modal.classList.remove(modalActiveClass)
      await toggleDataAttrOnModalTrigger({triggerName, modalName, toOpen: false})
      resolve()
    })
  }
  // close all open modals
  const closeAllModals = () => {
    return new Promise((resolve)=>{
      const modals = getElementsFromAttr({ attributeName:modalAttrName, attributeValue:null, getAll:true })
      if (!modals) return resolve()
      modals.forEach(async (modal)=>{
        const modalName = modal.getAttribute(modalAttrName)
        await handleCloseModal({modalAttrName, modalName})
      })
      resolve()
    })
  }
  // close modal when user clicks outside of it
  const handleModalCloseOnOutsideClick = () => {
    document.addEventListener('click', (e)=>{
      const modal = e.target.closest(`[${modalAttrName}]`)
      const clickedOnTrigger = e.target.closest(`[${triggerName}]`)
      if (!modal && !clickedOnTrigger) closeAllModals()
    })
  }
  // toggle modal
  const toggleModalVisibility = async ({e, modalAttrName, modalName}) => {
    e.preventDefault()
    const modalIsOpen = isModalOpen({modalAttrName, modalName})
    switch (modalIsOpen) {
      case true:
        handleCloseModal({modalAttrName, modalName})
        break
      case false:
        await closeAllModals()
        handleOpenModal({modalAttrName, modalName})
        break
    }
  }


  const removeElemTrigger = "data-remove-elem-trigger" // the attribute name for triggers for elements that should be removed once clicked
  const elemToRemoveAttrName = "data-remove-elem" // the attribute name for elements that should be removed once clicked
  const handleRemoveElem = ({elemToRemoveAttrName, elemToRemove}) => {
    const elemToRemoveEl = getElementsFromAttr({ attributeName:elemToRemoveAttrName, attributeValue:elemToRemove })
    if (!elemToRemoveEl) return false
    elemToRemoveEl.remove()
  }


  const progressTextName = ".completion .count"
  const progressBarProgressName = ".completion .progress .bar"
  // updates the text progress: "1 / 5 completed"
  const updateTextProgress = ({ text }) => {
    const progressText = document.querySelector(progressTextName)
    if (!progressText) return
    progressText.innerHTML = text
  }
  // updates the progress bar: "20%""
  const updateBarProgress = ({ progress }) => {
    const progressBar = document.querySelector(progressBarProgressName)
    if (!progressBar) return
    progressBar.style.width = `${progress}%`
  }
  // manages the progress bar and text progress update
  const updateProgress = () => {
    const setupGuide = getElementsFromAttr({ attributeName:"data-setup-guide" })
    const setUpListItems = setupGuide.querySelectorAll("li")
    let doneCount = 0;
    setUpListItems.forEach(item=>item.classList.contains("done") && doneCount++)
    const progress = { text: `${doneCount} / ${setUpListItems.length} completed`, bar: doneCount / setUpListItems.length * 100 }
    updateTextProgress({ text: progress.text })
    updateBarProgress({ progress: progress.bar })
  }
  // closes all open setup guide items so the active one can be opened
  const closeOtherSetupGuideItems = ({ currentItem }) => {
    return new Promise((resolve)=>{
      const setupGuide = getElementsFromAttr({ attributeName:"data-setup-guide" })
      const setUpListItems = setupGuide.querySelectorAll("li")
      setUpListItems.forEach(item=>item.classList.remove("is-active"))
      resolve()
    })
  }
  // handles opening/closing setup guide items
  const handleSetupGuideClick = async ({item, setUpListItems}) => {
    await closeOtherSetupGuideItems({ currentItem: item })
    item.classList.add("is-active")
  }
  // simulates loading for setup guide checkmarks when clicked
  const simulateLoading = ({iconSeriesContainer}) => {
    const defaultIcon = iconSeriesContainer.querySelector(".default")
    const loadingIcon = iconSeriesContainer.querySelector(".loading")
    const doneIcon = iconSeriesContainer.querySelector(".done")

    return new Promise((resolve)=>{
      // if done icon is showing, remove it and show default icon
      if(doneIcon.classList.contains("show")) {
        doneIcon.classList.remove("show")
        defaultIcon.classList.add("show")
        return resolve()
      }
      // else show loading icon, then done
      defaultIcon.classList.remove("show")
      loadingIcon.classList.add("show")
      setTimeout(()=>{
        loadingIcon.classList.remove("show")
        doneIcon.classList.add("show")
        return resolve()
      }, 1000)
    })
  }
  // handles setup guide checkmark clicks
  const handleSetupGuideCheckMarkClick = async ({iconSeriesContainer, setUpListItems}) => {
    await simulateLoading({iconSeriesContainer})
    const item = iconSeriesContainer.closest("li")
    item.classList.toggle("done") // this is what would be counted for progress
    updateProgress()
  }


  // bootstrap events
  (() => {
    // MODAL TRIGGER EVENTS
    const modalTriggers = getElementsFromAttr({ attributeName:triggerName, attributeValue:null, getAll:true })
    !!modalTriggers && modalTriggers.forEach((trigger)=>{
      const modalName = trigger.getAttribute(triggerName)
      trigger.addEventListener('click', (e)=>toggleModalVisibility({e, modalAttrName, modalName}))
    })
    handleModalCloseOnOutsideClick()

    // EVENT FOR REMOVING ELEMENTS FROM DOM WHEN ITS TRIGGER IS CLICKED
    const removeElemTriggers = getElementsFromAttr({ attributeName:removeElemTrigger, attributeValue:null, getAll:true })
    !!removeElemTriggers && removeElemTriggers.forEach((trigger)=>{
      const elemToRemove = trigger.getAttribute(removeElemTrigger)
      trigger.addEventListener('click', (e)=>handleRemoveElem({elemToRemoveAttrName, elemToRemove}))
    })

    // EVENTS FOR SETUP GUIDE
    const setupGuide = getElementsFromAttr({ attributeName:"data-setup-guide" })
    const setUpGuideVisibilityTrigger = setupGuide.querySelector("header .title svg")
    const setUpListItems = setupGuide.querySelectorAll("li")
    setUpGuideVisibilityTrigger.addEventListener('click', ()=>setupGuide.classList.toggle("show"))
    !!setUpListItems.length && setUpListItems.forEach((item)=>{
      item.addEventListener('click', (e)=>handleSetupGuideClick({item, setUpListItems}))
      // when user clicks on the checkmark svg
      const icons = item.querySelectorAll('svg') // selects the first svg
      icons.forEach((icon)=>icon.addEventListener('click', (e)=>{
        // prevent event bubbling
        e.stopPropagation()
        const iconSeriesContainer = e.target.closest(".check-icon")
        handleSetupGuideCheckMarkClick({iconSeriesContainer, setUpListItems})
      }))
    })
  })()
})()