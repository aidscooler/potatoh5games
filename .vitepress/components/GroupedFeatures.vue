<template>
    <div class="grouped-features">
      <div v-for="(group, groupName) in groupedFeatures" :key="groupName" class="feature-group">
        <h2 @click="toggleGroup(groupName)" class="group-title">
          {{ groupName }}
          <span class="toggle-icon">{{ isGroupOpen(groupName) ? '▼' : '▶' }}</span>
        </h2>
        <div v-show="isGroupOpen(groupName)" class="feature-list">
            <a 
                v-for="feature in group" 
                :key="feature.title" 
                :href="feature.link"
                class="feature-item">
                <div class="feature-icon" v-if="feature.icon">
                    <img :src="feature.icon.src" :alt="feature.title" style="width:64px;height:64px"/>
                </div>
                <h3 class="feature-title" style="margin:0px">{{ feature.title }}</h3>
                <p class="feature-details">{{ feature.details }}</p>
            </a>
        </div>
      </div>
    </div>
</template>
  
  <script setup>
  import featuresData from '../config/classic.json'
  
  const features = ref([])
  const openGroups = ref([])
  
  const fetchFeatures = async () => {
    try {
      //const response = await fetch('./../../config/classic.json')
      features.value = featuresData;//await response.json()
      openGroups.value = Object.keys(groupedFeatures.value)
    } catch (error) {
      console.error('Error fetching features:', error)
    }
  }
  
  onMounted(fetchFeatures)
  
  const groupedFeatures = computed(() => {
    return features.value.reduce((acc, feature) => {
      const group = feature.group || 'Uncategorized'
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(feature)
      return acc
    }, {})
  })
  
  const toggleGroup = (groupName) => {
    const index = openGroups.value.indexOf(groupName)
    if (index === -1) {
      openGroups.value.push(groupName)
    } else {
      openGroups.value.splice(index, 1)
    }
  }
  
  const isGroupOpen = (groupName) => {
    return openGroups.value.includes(groupName)
  }
  </script>
  
  <style scoped>
.grouped-features {
  padding: 1rem 0;
}
.group-title {
  cursor: pointer;
  user-select: none;
  margin-top: 2rem;
  color: var(--vp-c-text-1);
}
.toggle-icon {
  font-size: 0.8em;
  margin-left: 0.5rem;
}
.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 1rem 0;
  text-align: center;
}
.feature-item {
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  padding: 5px;
  transition: background-color 0.3s;
  text-decoration: none;
  color: inherit;
  display: block;
  border: 1px solid transparent; /* 添加透明边框 */  
}
.feature-item:hover {
  border-color: var(--vp-c-brand); /* 悬停时改变边框颜色 */
}

.feature-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.feature-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0rem;
  color: var(--vp-c-text-1);
}
.feature-details {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 0px !important; 
}
  </style>
  