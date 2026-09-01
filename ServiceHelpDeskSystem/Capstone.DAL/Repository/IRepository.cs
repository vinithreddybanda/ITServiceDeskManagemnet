using Capstone.DAL.Models;

namespace Capstone.DAL.Repository;

public interface IRepository
{
    bool Authenticate(User user);
    List<ServiceRequest> ViewRequests();
    List<ServiceRequest> ViewRequests(string userName);
    int RaiseRequest(ServiceRequest newRequest);
    ServiceRequest GetRequestByld(int requestId);
    bool ReOpenRequest(ServiceRequest request);
    List<ServiceRequest> GetRequestBySP(string userName);
    bool CloseRequest(int requestId);
    bool DeleteRequest(int requestId);
    User GetUser(string userName);
}