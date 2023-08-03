<template>
  <div>
    <h1>Real-Time Dashboard</h1>
    <p v-if="!isAuthenticated">Please login to view the dashboard.</p>
    <div v-else>
      <div class="container">
        <div class="row">
          <div class="col-md-6 col-sm-12 ">
              <Bar :data="data" :options="options" />
          </div>
          <div class="col-md-6 col-sm-12">
            <div class="row justify-content-center">
              <div class="col-md-6">
                <form @submit.prevent="onSubmit">
                  <div class="mb-3">
                    <label for="inputName" class="form-label">Add User</label>
                    <input v-model="userName" type="text" class="form-control  border-1 rounded-0 " required id="inputName"
                      placeholder="add new user">
                  </div>
                  <div class="mb-3">
                    <select v-model="category" class="form-select  border-1 rounded-0 " required aria-label="Default select example">
                      <option  value="Admin">Admin</option>
                      <option value="SalePerson">SalePerson</option>
                      <option value="Developer">Developer</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary">Submit</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-5">
            <table class="table">
              <thead>
                <tr>
                  <th sco pe="col">#</th>
                  <th sco pe="col">User Name</th>
                  <th scope="col">Category</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(user,index) in userData" :key="index">
                  <th scope="row">{{ index }}</th>
                  <th >{{ user.userName }}</th>
                  <th >{{ user.category }}</th>
                </tr>                
              </tbody>
            </table>

        </div>
      </div>
    </div>
  </div>
</template>
 
<script>
import io from 'socket.io-client';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  name: "DasboardPage",
  components: {
    Bar
  },
  data() {
    return {
      isAuthenticated: false,
      userName: null,
      category: null,
      data: {
        labels: ['Admin', 'SalePerson', 'Developer'],
        datasets: [{ data: [0, 0, 0] }]
      },
      userData:null,
      options: {
        responsive: true
      },

      socket: null
    };
  },
  mounted() {
    const token = localStorage.getItem('token');
    console.log(token)
    if (token) {
      this.isAuthenticated = true;
      // Connect to the Socket.IO server with the token
      this.socket = io('http://localhost:3000', {
        auth: { token },
      });

      this.socket.on('connect', () => {
        this.isAuthenticated = true;
        console.log('Connected to Socket.IO server');
      });

      this.socket.on('disconnect', () => {
        this.isAuthenticated = false;
        console.log('Disconnected from Socket.IO server');
      });

      this.socket.on('sendChartBarData', (data) => {
        let userData = this.countByCategory(data)
        this.userData=data;
        this.data = {
          labels: ['Admin', 'SalePerson', 'Developer'],
          datasets: [{ data: [userData["Admin"], userData["SalePerson"], userData["Developer"]] }]
        }
      });
    }

  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  methods: {
    countByCategory(data) {
      const count = {};

      data.forEach(item => {
        const { category } = item;
        if (count[category]) {
          count[category]++;
        } else {
          count[category] = 1;
        }
      });
      console.log(count)
      return count;
    },
    onSubmit() {

      this.socket.emit('form_data', {
        'userName': this.userName,
        'category': this.category
      });
    },
   

    changeData() {
      this.data = {
        labels: ['January2', 'February', 'March'],
        datasets: [{ data: [Math.random(), 10, 9] }]
      }
    }
  }
};
</script>

<style>
/* Your CSS styles here */
</style>